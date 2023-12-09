import fsp from "node:fs/promises";
import path from "node:path";
import { DIALOG_PATH } from "./config.js";
import { AssetDataRaw } from "./data-raw-type.js";
import { assetDownload } from "./imperium-asset-download.js";
import { ImperiumData } from "./imperium-data.js";
import { fsSerializer } from "./lib/FullSerializer/fsSerializer.js";
import { Logger } from "./logger.js";
import { outJson, rpFile } from "./out.js";
import { DialogAsset } from "./sdorica/DialogAsset.js";
import { interpreted as dialogInterpreted } from "./viewerjs/entry/DialogAsset.js";
import { siJsonParse } from "./viewerjs/utils.js";

const logger = new Logger("dialog-downloader");
const metadataFilePath = path.join(DIALOG_PATH, "metadata.json");

export function dialogDownloader(force = false) {
	const dialog = ImperiumData.fromDialog();
	return assetDownload(metadataFilePath, dialog, force, (name, asset) =>
		downloadDialog(name, asset),
	);
}

export async function downloadDialog(name: string, asset: AssetDataRaw) {
	const dialogFilePath = path.join(DIALOG_PATH, name);
	const jsonFilePath = path.join(DIALOG_PATH, `${name}.json`);

	logger.info(`downloading ${name}...`);
	try {
		await rpFile(asset.L, dialogFilePath);
	} catch (error) {
		logger.error(`download ${name} error:`, error);
		debugger;
		return false;
	}

	let data: DialogAsset;
	try {
		const jsonString = await fsp.readFile(dialogFilePath, { encoding: "utf8" });
		const json = siJsonParse(jsonString);
		data = json;

		try {
			const serializer = new fsSerializer();
			data = serializer.TryDeserialize(json);
			data.$interpreted = dialogInterpreted(data);
		} catch (error) {}
	} catch (error) {
		logger.error(`opening ${name} error:`, error);
		debugger;
		return false;
	}

	try {
		await outJson(jsonFilePath, data);
	} catch (error) {
		logger.error(`output ${name} error:`, error);
		debugger;
		return false;
	}
	return true;
}
