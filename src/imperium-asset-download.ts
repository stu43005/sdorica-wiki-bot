import pMap from "p-map";
import { AssetDataRaw } from "./data-raw-type.js";
import { ImperiumData } from "./imperium-data.js";
import { inputJsonDefault } from "./input.js";
import { Logger } from "./logger.js";
import { outJson } from "./out.js";

const logger = new Logger("imperium-asset-download");

type Metadata = Record<string, AssetDataRaw>;

export async function assetDownload(
	metadataFilePath: string,
	data: ImperiumData,
	force = false,
	downloadCallback: (name: string, asset: AssetDataRaw) => Promise<boolean>,
) {
	const meta = await inputJsonDefault<Metadata>(metadataFilePath, {});

	const assets = data.getTable("Assets");
	await pMap(
		assets,
		async (row) => {
			const name: string = row.get("BundleName");
			const asset = data.getAsset(row.get("Ref"));

			if (asset && checkNeedDownload(meta, name, asset, force)) {
				try {
					if (await downloadCallback(name, asset)) {
						meta[name] = asset;
					}
				} catch (error) {
					logger.error(`processing ${name} error:`, error);
				}
			}
		},
		{
			concurrency: 10,
		},
	);

	try {
		await outJson(metadataFilePath, meta);
	} catch (error) {
		logger.error(`output metadata error:`, error);
		debugger;
		return false;
	}
	return true;
}

function checkNeedDownload(meta: Metadata, name: string, asset: AssetDataRaw, force?: boolean) {
	if (force) {
		return true;
	}
	const metaAsset = meta[name];
	if (metaAsset?.H === asset.H) {
		logger.debug(`${name} not changed. skip`);
		return false;
	}
	return true;
}
