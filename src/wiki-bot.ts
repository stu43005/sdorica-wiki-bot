import config from "config";
import { Mwn } from "mwn";
import type { ApiEditResponse, ApiParams, RawRequestParams } from "mwn";
import url from "url";
import { discordWebhook } from "./discord-webhook.js";
import { Logger } from "./logger.js";
import { isDevMode } from "./utils.js";

const logger = new Logger("mwbot");
const DEFAULT_SUMMARY = "Upload by MWBot";

type MWRevision = {
	contentmodel?: string;
	contentformat?: string;
	"*": string;
};

type MWRevisionSlot = {
	slots: {
		main: MWRevision;
	};
};

declare module "mwn" {
	interface Mwn {
		readText(
			title: string,
			redirect: boolean,
			customRequestOptions?: RawRequestParams,
		): Promise<string>;
		exists(title: string, customRequestOptions?: RawRequestParams): Promise<boolean>;
		editOnDifference(
			title: string,
			content: string,
			summary?: string,
			customRequestOptions?: RawRequestParams,
		): Promise<void>;
	}
}

export async function getMWBot(): Promise<Mwn> {
	const bot = await Mwn.init({
		apiUrl: "https://sdorica.xyz/api.php",
		username: config.get<string>("mwbot.user"),
		password: config.get<string>("mwbot.pass"),
		defaultParams: {
			assert: "user",
		},
		userAgent: "sdorica-wiki-bot (https://github.com/stu43005/sdorica-wiki-bot)",
	});

	bot.readText = async function (
		this: Mwn,
		title: string,
		redirect: boolean,
		customRequestOptions?: RawRequestParams,
	): Promise<string> {
		const params: ApiParams = {
			action: "query",
			prop: "revisions",
			rvprop: "content",
			titles: title,
		};
		if (redirect) {
			params["redirects"] = 1;
		}
		const res = await this.request(params, customRequestOptions);

		if (res.query) {
			if (res.query["redirects"]) {
				for (let i = 0; i < res.query["redirects"].length; i++) {
					const r = res.query["redirects"][i];
					if (r.from == title) {
						title = r.to;
						break;
					}
				}
			}
			if (res.query["pages"]) {
				for (const pageid in res.query["pages"]) {
					const page = res.query["pages"][pageid];
					if (page.title == title && page.revisions) {
						if ("slots" in page.revisions[0]) {
							const slot = page.revisions[0] as MWRevisionSlot;
							return slot["slots"]["main"]["*"];
						} else {
							const revision = page.revisions[0] as MWRevision;
							return revision["*"];
						}
					}
				}
			}
		}
		return "";
	};

	bot.exists = async function (
		this: Mwn,
		title: string,
		customRequestOptions?: RawRequestParams,
	): Promise<boolean> {
		return (await this.readText(title, false, customRequestOptions)) ? true : false;
	};

	bot.editOnDifference = async function (
		this: Mwn,
		title: string,
		content: string,
		summary?: string,
		customRequestOptions?: RawRequestParams,
	): Promise<void> {
		const online = await this.readText(title, false, customRequestOptions);
		content = content.replace(/\r/g, "\n");
		if (content != online) {
			const editRes: ApiEditResponse = await this.save(
				title,
				content,
				summary ?? DEFAULT_SUMMARY,
				{ bot: true },
			);
			if (
				config.get("dcWebhook") &&
				title.startsWith("使用者:小飄飄/wiki/") &&
				editRes.newrevid &&
				!isDevMode()
			) {
				const pageUrl = url.format({
					protocol: "https",
					hostname: "sdorica.xyz",
					pathname: "/index.php",
					query: {
						title,
					},
				});
				const diffUrl = url.format({
					protocol: "https",
					hostname: "sdorica.xyz",
					pathname: "/index.php",
					query: {
						title,
						curid: editRes.pageid,
						diff: editRes.newrevid,
						oldid: editRes.oldrevid,
					},
				});
				await discordWebhook({
					username: "MWBot",
					content: `Edit: [${title}](${pageUrl}) ([diff](${diffUrl}))`,
				});
			}
			logger.log(`Edit: ${title}`);
		} else {
			logger.log(`No modify: ${title}`);
		}
	};

	return bot;
}
