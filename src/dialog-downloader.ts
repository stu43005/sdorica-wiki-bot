import * as fs from 'fs-extra';
import * as path from 'path';
import { DIALOG_PATH } from './config';
import { AssetDataRaw } from './data-raw-type';
import { ImperiumData } from "./imperium-data";
import { inputJsonSync } from "./input";
import { fsSerializer } from './lib/FullSerializer/fsSerializer';
import { Logger } from './logger';
import { fsExists, outJson, rpFile } from './out';
import { DialogAsset } from './sdorica/DialogAsset';
import { interpreted as dialogInterpreted } from './viewerjs/entry/DialogAsset';
import { siJsonParse } from './viewerjs/utils';

const logger = new Logger('dialog-downloader');
const metadataFilePath = path.join(DIALOG_PATH, 'metadata.json');

type Metadata = Record<string, AssetDataRaw>;

export async function dialogDownloader(force = false) {
	let meta: Metadata = {};
	try {
		if (await fsExists(metadataFilePath)) {
			meta = inputJsonSync<Metadata>(metadataFilePath);
		}
	} catch (error) {
	}

	const dialog = ImperiumData.fromDialog();
	const assets = dialog.getTable('Assets');
	for (const row of assets) {
		const name: string = row.get('BundleName');
		const asset = dialog.getAsset(row.get('Ref'));

		if (checkNeedDownload(meta, name, asset, force)) {
			if (await downloadDialog(name, asset)) {
				meta[name] = asset;
			}
		}
	}

	try {
		await outJson(metadataFilePath, meta);

	} catch (error) {
		logger.error(`output metadata error:`, error);
		debugger;
		return false;
	}
	return true;
}

function checkNeedDownload(meta: Metadata | null, name: string, asset: AssetDataRaw, force?: boolean) {
	if (force) {
		return true;
	}
	if (meta) {
		const metaAsset = meta[name];
		if (metaAsset?.H === asset.H) {
			logger.log(`${name} not changed. skip`);
			return false;
		}
	}
	return true;
}

export async function downloadDialog(name: string, asset: AssetDataRaw) {
	const dialogFilePath = path.join(DIALOG_PATH, name);
	const jsonFilePath = path.join(DIALOG_PATH, `${name}.json`);

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

		} catch (error) {
		}

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
