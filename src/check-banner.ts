import axios from "axios";
import config from "config";
import path from "node:path";
import { API_CONFIG_PATH, ApiConfig, BANNERS_PATH, LATEST_PATH } from "./config";
import { LatestDataRaw } from "./data-raw-type";
import { discordWebhook } from "./discord-webhook";
import { inputJsonDefault, inputJsonSync } from "./input";
import { Logger } from "./logger";
import { outJson, rpFile } from "./out";

const logger = new Logger("check-banner");
const bannerUrlsPath = path.join(BANNERS_PATH, "banner_urls.json");

async function loginToGame() {
	const apiConfig: ApiConfig = inputJsonSync(API_CONFIG_PATH);
	const gameAuthenticate = config.get<{ account: string; secret: string }>("gameAuthenticate");
	const gamedataLatest: LatestDataRaw = inputJsonSync(path.join(LATEST_PATH, "gamedata.json"));

	logger.log("get service token...");
	const axiosInstance = axios.create({
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	let res = await axiosInstance.post(
		"https://2x0x0-api-phoebe.rayark.net/service/email/authenticate",
		gameAuthenticate
	);
	logger.debug("rayark pass authenticate:", res.data);
	const { auth_code: serviceToken } = res.data;

	logger.log("get access token...");
	res = await axiosInstance.post("https://2x0x0-api-phoebe.rayark.net/service/email/login", {
		service_token: serviceToken,
		app_key: apiConfig.app_key,
		params: apiConfig.params,
	});
	logger.debug("rayark pass login:", res.data);
	const { access_token: accessToken } = res.data;

	logger.log("login to game...");
	const gameInstance = axios.create({
		baseURL: apiConfig.host,
		headers: {
			"Access-Token": accessToken,
			"Game-Data-Revision": `${gamedataLatest.R}`,
		},
	});
	res = await gameInstance.post(
		"/p/login",
		{
			deviceUniqueIdentifier: apiConfig.deviceUniqueIdentifier,
		},
		{
			headers: {
				Zone: apiConfig.zone,
			},
		}
	);
	logger.debug("game login:", res.data);
	return gameInstance;
}

async function downloadBanner(type: string, url: string) {
	const downloadPath = path.join(BANNERS_PATH, type, path.basename(url));

	try {
		await rpFile(url, downloadPath);
	} catch (e) {
		logger.error("download banner error:", e);
		debugger;
		return false;
	}
	return true;
}

export async function checkBanner(debug = false, lang = "zh_TW") {
	const bannerUrls = await inputJsonDefault<string[]>(bannerUrlsPath, []);

	try {
		const gameInstance = await loginToGame();

		logger.log("get banners...");
		const bannersRes = await gameInstance.get<DataContainer<Banners>>("/p/banners");
		logger.debug("banners:", bannersRes.data);
		for (const banner of bannersRes.data.data.banners) {
			logger.log(`banner: ${banner.actionValue}`);
			for (const [type, url] of Object.entries(banner.bannerUrls[lang])) {
				if (!bannerUrls.includes(url) || debug) {
					logger.log(`new ${type}: ${url}`);
					await downloadBanner(type, url);
					if (!debug) {
						await discordWebhook({
							content: `<:DankPuggi:493777695008882688> ${type}: ${url}`,
						});
					}
					bannerUrls.push(url);
				}
			}
		}

		logger.log("get iap...");
		const iapListRes = await gameInstance.post<DataContainer<IapList>>("/iap/list");
		logger.debug("iap:", iapListRes.data);
		for (const banner of iapListRes.data.data.banners) {
			logger.log(`banner: ${banner.actionValue}`);
			for (const [, url] of Object.entries(banner.bannerUrls[lang])) {
				const type = "iap";
				if (!bannerUrls.includes(url) || debug) {
					logger.log(`new ${type}: ${url}`);
					await downloadBanner(type, url);
					if (!debug) {
						await discordWebhook({
							content: `<:DankPuggi:493777695008882688> ${type}: ${url}`,
						});
					}
					bannerUrls.push(url);
				}
			}
		}
	} catch (error) {
		let content = "";
		if (axios.isAxiosError(error)) {
			content = error.response?.data ?? error.message;
		} else {
			content = `${error}`;
		}
		logger.error(content);
		debugger;
		if (!debug) {
			await discordWebhook({ content });
		}
		throw error;
	} finally {
		try {
			await outJson(bannerUrlsPath, bannerUrls);
		} catch (error) {
			logger.error("output bannerUrls error:", error);
			debugger;
		}
	}
}

interface DataContainer<T> {
	data: T;
}

interface Banners {
	banners: Banner[];
}

interface Banner {
	action: number;
	actionValue: string;
	order: number;
	isRegular: boolean;
	eventBeginTime: number;
	eventEndTime: number;
	bannerUrls: { [lang: string]: BannerURL };
	tagType: string;
	untilExpired: number;
}

interface BannerURL {
	banner: string;
	cover: string;
}

interface IapList {
	purchaseStats: unknown;
	activeProducts: unknown[];
	banners: IapBanner[];
}

interface IapBanner {
	id: string;
	action: number;
	actionValue: string;
	order: number;
	isRegular: boolean;
	eventBeginTime: number;
	eventEndTime: number;
	bannerUrls: { [lang: string]: BannerURL };
}
