import * as path from "path";
import { GAMEDATA_PATH, LATEST_PATH, ORIGIN_PATH } from "./config";
import { ImperiumDataRaw, LatestDataRaw } from "./data-raw-type";
import { ImperiumData } from './imperium-data';
import { inputFilePack, inputJsonSync, isImperiumData, isLatestData } from "./input";
import { Logger } from "./logger";
import { fsExists, outCsv, outJson, outXlsx, rpFile } from "./out";
import { dataOut } from "./out-data";

const logger = new Logger('downloader');

export function getLatestUrl(key: string, uuid: string) {
	let host = "origin-sdorica.rayark.download";
	if (key.startsWith("longyuan/")) {
		host = "exp-dl.sdorica.dragonest.com";
	}
	if (key.startsWith("soe/")) {
		host = "soe.rayark.download";
	}
	if (key.includes("/")) {
		key = key.split("/")[1];
	}
	return `https://${host}/${key}/client_latest/${uuid}/latest`;
}

export function getGamedataUrl(key: string, uuid: string) {
	let host = "sdorica.rayark.download";
	if (key.startsWith("longyuan/")) {
		host = "exp-dl.sdorica.dragonest.com";
	}
	if (key.startsWith("soe/")) {
		host = "soe.rayark.download";
	}
	if (key.includes("/")) {
		key = key.split("/")[1];
	}
	return `https://${host}/${key}/client_gamedata/${uuid}/default/gamedata`;
}

export async function downloadLatest(key: string, uuid: string, force = false) {
	const url = getLatestUrl(key, uuid);
	const msgpackFilePath = path.join(LATEST_PATH, `${key}.msgpack`);
	const jsonFilePath = path.join(LATEST_PATH, `${key}.json`);

	try {
		await rpFile(url, msgpackFilePath);
	} catch (error) {
		logger.error('download latest error:', error);
		debugger;
		return false;
	}

	let data: LatestDataRaw;
	try {
		const input = await inputFilePack(msgpackFilePath);

		if (isLatestData(input)) {
			data = input;
		} else {
			throw new Error("Not LatestData");
		}
	} catch (error) {
		logger.error('opening latest error:', error);
		debugger;
		return false;
	}

	try {
		let updated = false;

		if (await fsExists(jsonFilePath)) {
			const oldData = inputJsonSync<LatestDataRaw>(jsonFilePath);
			if (data.R > oldData.R) {
				updated = true;
			}
		} else {
			updated = true;
		}

		await outJson(jsonFilePath, data);

		if (updated || force) {
			await downloadGamedata(key, data);
			logger.log(`down ${key}: ${data.I}`);
		} else {
			logger.log(`pass ${key}: ${data.I}`);
		}
		return updated;

	} catch (error) {
		logger.error('output latest error:', error);
		debugger;
		return false;
	}
}

export async function downloadGamedata(key: string, latest: LatestDataRaw) {
	const url = getGamedataUrl(key, latest.I);
	const msgpackFilePath = path.join(GAMEDATA_PATH, `${key}.msgpack`);
	const jsonFilePath = path.join(GAMEDATA_PATH, `${key}.json`);
	const csvFilePath = path.join(GAMEDATA_PATH, `${key}.csv`);
	const xlsxFilePath = path.join(GAMEDATA_PATH, `${key}.xlsx`);

	try {
		await rpFile(url, msgpackFilePath);
	}
	catch (e) {
		logger.error('download gamedata error:', e);
		debugger;
		return false;
	}

	let data: ImperiumDataRaw;
	try {
		const input = await inputFilePack(msgpackFilePath);

		if (isImperiumData(input)) {
			data = input;
		} else {
			throw new Error("Not ImperiumData");
		}
	} catch (error) {
		logger.error('opening gamedata error:', error);
		debugger;
		return false;
	}

	try {
		await outJson(jsonFilePath, data);
		await outCsv(csvFilePath, dataOut(data));
		await outXlsx(xlsxFilePath, data);

		if (ImperiumData.has(key)) {
			await ImperiumData.from(key).reloadData();
		}

	} catch (error) {
		logger.error('output gamedata error:', error);
		debugger;
		return false;
	}
	return true;
}

export async function downloader(force?: boolean) {
	const origin: Record<string, string> = inputJsonSync(ORIGIN_PATH);
	const result: Record<string, boolean> = {};

	for (const key in origin) {
		if (Object.prototype.hasOwnProperty.call(origin, key)) {
			const originUuid = origin[key];
			result[key] = await downloadLatest(key, originUuid, force);
		}
	}
	return result;
}
