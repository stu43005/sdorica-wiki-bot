import * as bson from "bson";
import JSZip from "jszip";
import * as _ from "lodash-es";
import fsp from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import pWaterfall from "p-waterfall";
import { unzip } from "zlib";
import { CHARASSETS_PATH } from "./config.js";
import { AssetDataRaw } from "./data-raw-type.js";
import { ImperiumData } from "./imperium-data.js";
import { inputJsonSync } from "./input.js";
import { fsSerializer } from "./lib/FullSerializer/fsSerializer.js";
import { localizationBuffName, localizationCharacterName } from "./localization.js";
import { Logger } from "./logger.js";
import { fsExists, outJson, rpFile } from "./out.js";
import { conditionStringify } from "./sdorica/BattleModel/condition/ConditionStringify.js";
import { sortByCharacterModelNo } from "./utils.js";
import { interpreted as battleCharacterInterpreted } from "./viewerjs/entry/BattleCharacterAsset.js";
import { interpreted as buffInterpreted } from "./viewerjs/entry/BuffAsset.js";
import { siJsonParse } from "./viewerjs/utils.js";

const doUnzip = promisify(unzip);

const logger = new Logger("charassets-downloader");
const metadataFilePath = path.join(CHARASSETS_PATH, "metadata.json");
const keysFilePath = path.join(CHARASSETS_PATH, "charAssets-keys.json");

export async function charAssetsDownloader(force = false) {
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
				logger.log(`charAssets not changed. skip`);
				return false;
			}
		}
	} catch (error) {}
	return true;
}

export async function downloadCharAssetsBson(asset: AssetDataRaw, force?: boolean) {
	const bsonFilePath = path.join(CHARASSETS_PATH, "charAssets.bson");
	const jsonFilePath = path.join(CHARASSETS_PATH, "charAssets.json");

	if (!(await checkNeedDownload(asset, force))) {
		return false;
	}

	try {
		await rpFile(asset.L, bsonFilePath);
	} catch (error) {
		logger.error("download charAssets.bson error:", error);
		debugger;
		return false;
	}

	let data: any;
	try {
		data = await pWaterfall(
			[
				(filePath) => fsp.readFile(filePath, { encoding: "utf8" }),
				(b64content) => Buffer.from(b64content, "base64"),
				(buf) => bson.deserialize(buf),
			],
			bsonFilePath,
		);
	} catch (error) {
		logger.error("opening charAssets.bson error:", error);
		debugger;
		return false;
	}

	try {
		await outJson(jsonFilePath, data);

		const keysJson = {
			BattleCharacters: Object.keys(data.BattleCharacters)
				.sort(sortByCharacterModelNo)
				.map((k) => {
					const name = localizationCharacterName()(k);
					return `${k}${name ? ` (${name})` : ""}`;
				}),
			Buffs: Object.keys(data.Buffs)
				.sort(sortByCharacterModelNo)
				.map((k) => localizationBuffName(true)(k)),
		};
		await outJson(keysFilePath, keysJson);

		await outJson(metadataFilePath, asset);
	} catch (error) {
		logger.error("output charAssets error:", error);
		debugger;
		return false;
	}
	return true;
}

export async function downloadCharAssetsZip(asset: AssetDataRaw, force?: boolean) {
	const zipFilePath = path.join(CHARASSETS_PATH, "CharAssets.zip");

	if (!(await checkNeedDownload(asset, force))) {
		return false;
	}

	try {
		await rpFile(asset.L, zipFilePath);
	} catch (error) {
		logger.error("download CharAssets.zip error:", error);
		debugger;
		return false;
	}

	try {
		const zip = await pWaterfall(
			[(filePath) => fsp.readFile(filePath), (data) => JSZip.loadAsync(data)],
			zipFilePath,
		);

		const serializer = new fsSerializer();
		for (const zipEntry of Object.values(zip.files)) {
			try {
				const info = getCharAssetEntryInfo(zipEntry.name);
				let data = await pWaterfall(
					[
						(zipEntry) => zipEntry.async("nodebuffer"),
						(buf) => doUnzip(buf),
						(buf) => buf.toString("utf8"),
						(jsonString) => siJsonParse(jsonString),
					],
					zipEntry,
				);
				try {
					data = serializer.TryDeserialize(data);

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
				} catch (error) {}

				const jsonFilePath = path.join(CHARASSETS_PATH, info.outJsonName);
				await outJson(jsonFilePath, data);

				if (info.modelName === "Manifest") {
					try {
						function findKeys(infos: CharAssetEntryInfo[], type: CharAssetEntryType) {
							const arr = infos.filter((info) => info.type === type);
							_.pull(infos, ...arr);
							return arr.map((info) => info.modelName);
						}

						const infos = Object.keys(data).map((name) => getCharAssetEntryInfo(name));
						const battleCharacters = findKeys(
							infos,
							CharAssetEntryType.BATTLECHARACTOR,
						);
						const buffs = findKeys(infos, CharAssetEntryType.BUFF);
						const keysJson = {
							BattleCharacters: battleCharacters
								.sort(sortByCharacterModelNo)
								.map((k) => {
									const name = localizationCharacterName()(k);
									return `${k}${name ? ` (${name})` : ""}`;
								}),
							Buffs: buffs
								.sort(sortByCharacterModelNo)
								.map((k) => localizationBuffName(true)(k)),
							Others: infos
								.map((info) => info.fileName)
								.sort((a, b) => a.localeCompare(b)),
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
		logger.error("extracts CharAssets.zip error:", error);
		debugger;
		return false;
	}
	return true;
}

enum CharAssetEntryType {
	UNKNOWN = "unknown",
	BATTLECHARACTOR = "battlecharacter_",
	BUFF = "buff_",
	CONDITION = "condition_",
}

interface CharAssetEntryInfo {
	fileName: string;
	modelName: string;
	type: CharAssetEntryType;
	outJsonName: string;
}

function getCharAssetEntryInfo(filename: string): CharAssetEntryInfo {
	const name = filename.replace(/\.[^\.]+$/, "");

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
		modelName: name.replace(type, ""),
		type,
		outJsonName: `${name}.json`,
	};
}
