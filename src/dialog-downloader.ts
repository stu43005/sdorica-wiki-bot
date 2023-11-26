import * as fs from "fs-extra";
import * as path from "path";
import { DIALOG_PATH } from "./config";
import { AssetDataRaw } from "./data-raw-type";
import { assetDownload } from "./imperium-asset-download";
import { ImperiumData } from "./imperium-data";
import { fsSerializer } from "./lib/FullSerializer/fsSerializer";
import { Logger } from "./logger";
import { outJson, rpFile } from "./out";
import { DialogAsset } from "./sdorica/DialogAsset";
import { interpreted as dialogInterpreted } from "./viewerjs/entry/DialogAsset";
import { siJsonParse } from "./viewerjs/utils";

const logger = new Logger("dialog-downloader");
const metadataFilePath = path.join(DIALOG_PATH, "metadata.json");

export function dialogDownloader(force = false) {
	const dialog = ImperiumData.fromDialog();
	return assetDownload(metadataFilePath, dialog, force, (name, asset) =>
		downloadDialog(name, asset)
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
		const jsonString = await fs.readFile(dialogFilePath, { encoding: "utf8" });
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
