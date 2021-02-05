import * as bson from 'bson';
import * as fs from 'fs-extra';
import JSZip from 'jszip';
import * as _ from 'lodash';
import * as path from 'path';
import { promisify } from 'util';
import { unzip } from 'zlib';
import { CHARASSETS_PATH } from './config';
import { AssetDataRaw } from './data-raw-type';
import { ImperiumData } from "./imperium-data";
import { inputJsonSync } from "./input";
import { fsSerializer } from './lib/FullSerializer/fsSerializer';
import { localizationBuffName, localizationCharacterName } from "./localization";
import { Logger } from './logger';
import { fsExists, outJson, rpFile } from './out';
import { conditionStringify } from './sdorica/BattleModel/condition/ConditionStringify';
import { sortByCharacterModelNo } from "./utils";
import { interpreted as battleCharacterInterpreted } from './viewerjs/entry/BattleCharacterAsset';
import { interpreted as buffInterpreted } from './viewerjs/entry/BuffAsset';
import { siJsonParse } from './viewerjs/utils';

const doUnzip = promisify(unzip);

const logger = new Logger('charassets-downloader');
const metadataFilePath = path.join(CHARASSETS_PATH, 'metadata.json');
const keysFilePath = path.join(CHARASSETS_PATH, 'charAssets-keys.json');

export async function charAssetsDownloader(force?: boolean) {
	const charAssets = ImperiumData.fromCharAssets();
	const bsonAsset = charAssets.getAsset("charAssets.bson");
	const zipAsset = charAssets.getAsset("CharAssets.zip");
	if (zipAsset) {
		return await downloadCharAssetsZip(zipAsset, force);
	} else if (bsonAsset) {
		return await downloadCharAssetsBson(bsonAsset, force);
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
		B: 0,
	};
	return await downloadCharAssetsBson(asset);
}

async function checkNeedDownload(asset: AssetDataRaw, force?: boolean) {
	if (force) {
		return true;
	}
	try {
		if (await fsExists(metadataFilePath)) {
			const meta = inputJsonSync<AssetDataRaw>(metadataFilePath);
			if (meta.I === asset.I) {
				return false;
			}
		}
	} catch (error) {
	}
	return true;
}

export async function downloadCharAssetsBson(asset: AssetDataRaw, force?: boolean) {
	const bsonFilePath = path.join(CHARASSETS_PATH, 'charAssets.bson');
	const jsonFilePath = path.join(CHARASSETS_PATH, 'charAssets.json');

	if (!checkNeedDownload(asset, force)) {
		return false;
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

export async function downloadCharAssetsZip(asset: AssetDataRaw, force?: boolean) {
	const zipFilePath = path.join(CHARASSETS_PATH, 'CharAssets.zip');

	if (!checkNeedDownload(asset, force)) {
		return false;
	}

	try {
		await rpFile(asset.L, zipFilePath);
	} catch (error) {
		logger.error('download CharAssets.zip error:', error);
		debugger;
		return false;
	}

	try {
		const data = await fs.readFile(zipFilePath);
		const zip = await JSZip.loadAsync(data);

		const serializer = new fsSerializer();
		for (const zipEntry of Object.values(zip.files)) {
			try {
				const info = getCharAssetEntryInfo(zipEntry.name);
				const content = await zipEntry.async('nodebuffer');
				const jsonBuffer = await doUnzip(content);
				const jsonString = jsonBuffer.toString('utf8');
				const json = siJsonParse(jsonString);
				let data = json;
				try {
					data = serializer.TryDeserialize(json);

					switch (info.type) {
						case CharAssetEntryType.BATTLECHARACTOR:
							data.$interpreted = battleCharacterInterpreted(info.modelName, data, 0);
							break;
						case CharAssetEntryType.BUFF:
							data.$interpreted = buffInterpreted(info.modelName, data);
							break;
						case CharAssetEntryType.CONDITION:
							data.$interpreted = conditionStringify(data);
							break;
					}
				} catch (error) {
				}

				const jsonFilePath = path.join(CHARASSETS_PATH, info.outJsonName);
				await outJson(jsonFilePath, data);

				if (info.modelName === 'Manifest') {
					try {
						function findKeys(infos: CharAssetEntryInfo[], type: CharAssetEntryType) {
							const arr = infos.filter(info => info.type === type);
							_.pull(infos, ...arr);
							return arr.map(info => info.modelName);
						}

						const infos = Object.keys(data).map(name => getCharAssetEntryInfo(name));
						const battleCharacters = findKeys(infos, CharAssetEntryType.BATTLECHARACTOR);
						const buffs = findKeys(infos, CharAssetEntryType.BUFF);
						const keysJson = {
							BattleCharacters: battleCharacters.sort(sortByCharacterModelNo).map(k => {
								const name = localizationCharacterName()(k);
								return `${k}${name ? ` (${name})` : ""}`;
							}),
							Buffs: buffs.sort(sortByCharacterModelNo).map(k => localizationBuffName(true)(k)),
							Others: infos.map(info => info.fileName).sort((a, b) => a.localeCompare(b)),
						};
						await outJson(keysFilePath, keysJson);

					} catch (error) {
						logger.error(`output charAssets-keys.json error:`, error);
						debugger;
					}
				}

			} catch (error) {
				logger.error(`extract ${zipEntry.name} error:`, error);
				debugger;
			}
		}

		await outJson(metadataFilePath, asset);

	} catch (error) {
		logger.error('extracts CharAssets.zip error:', error);
		debugger;
		return false;
	}
	return true;
}

enum CharAssetEntryType {
	UNKNOWN = 'unknown',
	BATTLECHARACTOR = 'battlecharacter_',
	BUFF = 'buff_',
	CONDITION = 'condition_',
}

interface CharAssetEntryInfo {
	fileName: string;
	modelName: string;
	type: CharAssetEntryType;
	outJsonName: string;
}

function getCharAssetEntryInfo(filename: string): CharAssetEntryInfo {
	const name = filename.replace(/\.[^\.]+$/, '');

	let type = CharAssetEntryType.UNKNOWN;
	if (name.startsWith(CharAssetEntryType.BATTLECHARACTOR)) {
		type = CharAssetEntryType.BATTLECHARACTOR;
	} else if (name.startsWith(CharAssetEntryType.BUFF)) {
		type = CharAssetEntryType.BUFF;
	} else if (name.startsWith(CharAssetEntryType.CONDITION)) {
		type = CharAssetEntryType.CONDITION;
	}

	return {
		fileName: name,
		modelName: name.replace(type, ''),
		type,
		outJsonName: `${name}.json`,
	};
}
