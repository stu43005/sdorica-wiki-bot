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
import { sortByCharacterModelNo } from "./utils";
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
				const content = await zipEntry.async('nodebuffer');
				const jsonBuffer = await doUnzip(content);
				const jsonString = jsonBuffer.toString('utf8');
				const json = siJsonParse(jsonString);
				let data = json;
				try {
					data = serializer.TryDeserialize(json);
				} catch (error) {
				}

				const jsonFileName = zipEntry.name.replace(/\.[^\.]+$/, '.json');
				const jsonFilePath = path.join(CHARASSETS_PATH, jsonFileName);
				await outJson(jsonFilePath, data);

				if (jsonFileName === 'Manifest.json') {
					try {
						function findKeys(keys: string[], prefix: string) {
							const arr = keys.filter(name => name.startsWith(prefix));
							_.pull(keys, ...arr);
							return arr.map(name => name.replace(prefix, ''));
						}
						const keys = Object.keys(data).map(name => name.replace(/\.[^\.]+$/, ''));
						const battleCharacters = findKeys(keys, 'battlecharacter_');
						const buffs = findKeys(keys, 'buff_');
						const keysJson = {
							BattleCharacters: battleCharacters.sort(sortByCharacterModelNo).map(k => {
								const name = localizationCharacterName()(k);
								return `${k}${name ? ` (${name})` : ""}`;
							}),
							Buffs: buffs.sort(sortByCharacterModelNo).map(k => localizationBuffName(true)(k)),
							Others: keys.sort((a, b) => a.localeCompare(b)),
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
