import { AssetDataRaw } from "./data-raw-type";
import { ImperiumData } from "./imperium-data";
import { inputJsonDefault } from "./input";
import { Logger } from "./logger";
import { outJson } from "./out";

const logger = new Logger("imperium-asset-download");

type Metadata = Record<string, AssetDataRaw>;

export async function assetDownload(
	metadataFilePath: string,
	data: ImperiumData,
	force = false,
	downloadCallback: (name: string, asset: AssetDataRaw) => Promise<boolean>
) {
	const meta = await inputJsonDefault<Metadata>(metadataFilePath, {});

	const assets = data.getTable("Assets");
	for (const row of assets) {
		const name: string = row.get("BundleName");
		const asset = data.getAsset(row.get("Ref"));

		if (asset && checkNeedDownload(meta, name, asset, force)) {
			if (await downloadCallback(name, asset)) {
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

function checkNeedDownload(meta: Metadata, name: string, asset: AssetDataRaw, force?: boolean) {
	if (force) {
		return true;
	}
	const metaAsset = meta[name];
	if (metaAsset?.H === asset.H) {
		logger.log(`${name} not changed. skip`);
		return false;
	}
	return true;
}
