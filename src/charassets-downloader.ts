import * as bson from "bson";
import * as fs from 'fs-extra';
import * as path from 'path';
import { CHARASSETS_PATH } from './config';
import { AssetDataRaw } from './data-raw-type';
import { ImperiumData } from "./imperium-data";
import { inputJsonSync } from "./input";
import { localizationBuffName, localizationCharacterName } from "./localization";
import { Logger } from './logger';
import { fsExists, outJson, rpFile } from './out';
import { sortByCharacterModelNo } from "./utils";

const logger = new Logger('charassets-downloader');

export async function charAssetsDownloader() {
	const charAssets = ImperiumData.from('charAssets');
	const asset = charAssets.getAsset("charAssets.bson");
	if (asset) {
		return await downloadCharAssets(asset);
	} else {
		logger.error("charAssets.bson asset not exists.");
		debugger;
		return false;
	}
}

export async function charAssetsDownloadByUuid(uuid: string) {
	const url = `https://sdorica.rayark.download/charAssets/client_assets/${uuid}/charAssets.bson`;
	const asset: AssetDataRaw = {
		I: uuid,
		L: url,
		H: "",
	};
	return await downloadCharAssets(asset);
}

export async function downloadCharAssets(asset: AssetDataRaw) {
	const metadataFilePath = path.join(CHARASSETS_PATH, 'metadata.json');
	const bsonFilePath = path.join(CHARASSETS_PATH, 'charAssets.bson');
	const jsonFilePath = path.join(CHARASSETS_PATH, 'charAssets.json');
	const keysFilePath = path.join(CHARASSETS_PATH, 'charAssets-keys.json');

	try {
		if (await fsExists(metadataFilePath)) {
			const meta = inputJsonSync<AssetDataRaw>(metadataFilePath);
			if (meta.I === asset.I) {
				return false;
			}
		}
	} catch (error) {
	}

	try {
		await rpFile(asset.L, bsonFilePath);
	} catch (error) {
		logger.error('download charAssets.bson error:', error);
		debugger;
		return false;
	}

	let data: any;
	try {
		const b64content = await fs.readFile(bsonFilePath, { encoding: "utf8" });
		const content = Buffer.from(b64content, "base64");
		data = bson.deserialize(content);

	} catch (error) {
		logger.error('opening charAssets.bson error:', error);
		debugger;
		return false;
	}

	try {
		await outJson(jsonFilePath, data);

		const keysJson = {
			BattleCharacters: Object.keys(data.BattleCharacters).sort(sortByCharacterModelNo).map(k => {
				const name = localizationCharacterName()(k);
				return `${k}${name ? ` (${name})` : ""}`;
			}),
			Buffs: Object.keys(data.Buffs).sort(sortByCharacterModelNo).map(k => localizationBuffName(true)(k)),
		};
		await outJson(keysFilePath, keysJson);

		await outJson(metadataFilePath, asset);

	} catch (error) {
		logger.error('output charAssets error:', error);
		debugger;
		return false;
	}
	return true;
}
