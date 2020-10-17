import config from 'config';
import MWBot, { MWRevision, MWRevisionSlot } from "mwbot";
import url from "url";
import { Logger } from './logger';
import { discordWebhook, isDevMode } from "./utils";

const logger = new Logger('mwbot');

export async function getMWBot() {
	const bot = new MWBot({
		apiUrl: 'https://sdorica.xyz/api.php',
		defaultSummary: 'Upload by MWBot',
	});
	await bot.loginGetEditToken({
		username: config.get<string>("mwbot.user"),
		password: config.get<string>("mwbot.pass"),
	});

	bot.readText = async function (title: string, redirect: boolean, customRequestOptions?: MWBot.RequestOptions): Promise<string> {
		const res = redirect ? await this.read(title, redirect, customRequestOptions) : await this.request({
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			titles: title,
		}, customRequestOptions);

		if (res.query) {
			if (res.query.redirects) {
				for (let i = 0; i < res.query.redirects.length; i++) {
					const redirect = res.query.redirects[i];
					if (redirect.from == title) {
						title = redirect.to;
						break;
					}
				}
			}
			if (res.query.pages) {
				for (const pageid in res.query.pages) {
					const page = res.query.pages[pageid];
					if (page.title == title && page.revisions) {
						if ("slots" in page.revisions[0]) {
							const slot = page.revisions[0] as MWRevisionSlot;
							return slot["slots"]["main"]["*"];
						}
						else {
							const revision = page.revisions[0] as MWRevision;
							return revision['*'];
						}
					}
				}
			}
		}
		return "";
	};

	bot.exists = async function (title: string, customRequestOptions?: MWBot.RequestOptions): Promise<boolean> {
		return (await this.readText(title, false, customRequestOptions)) ? true : false;
	};

	bot.editOnDifference = async function (title: string, content: string, summary?: string, customRequestOptions?: MWBot.RequestOptions): Promise<void> {
		const online = await this.readText(title, false, customRequestOptions);
		content = content.replace(/\r/g, "\n");
		if (content != online) {
			const editRes = await this.edit(title, content, summary, Object.assign({}, customRequestOptions, {
				bot: true,
			}));
			if (config.get('dcWebhook') && title.startsWith("使用者:小飄飄/wiki/") && editRes.edit.newrevid && !isDevMode()) {
				const pageUrl = url.format({
					protocol: 'https',
					hostname: 'sdorica.xyz',
					pathname: '/index.php',
					query: {
						title,
					}
				});
				const diffUrl = url.format({
					protocol: 'https',
					hostname: 'sdorica.xyz',
					pathname: '/index.php',
					query: {
						title,
						curid: editRes.edit.pageid,
						diff: editRes.edit.newrevid,
						oldid: editRes.edit.oldrevid,
					}
				});
				await discordWebhook({
					"username": "MWBot",
					"content": `Edit: [${title}](${pageUrl}) ([diff](${diffUrl}))`,
				});
			}
			logger.log(`[S] [MWBOT] Edit: ${title}`);
		}
		else {
			logger.log(`[i] [MWBOT] No modify: ${title}`);
		}
	};

	return bot;
}
