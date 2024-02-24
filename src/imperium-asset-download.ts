import pMap from "p-map";
import { AssetDataRaw } from "./data-raw-type.js";
import { ImperiumData, type TableSchema, type TableType } from "./imperium-data.js";
import { inputJsonDefault } from "./input.js";
import { Logger } from "./logger.js";
import { outJson } from "./out.js";

const logger = new Logger("imperium-asset-download");

const AssetTableSchema = {
	BundleName: "String",
	Ref: "Asset",
	Size: "Integer",
	Tag: "String",
	UpdatePolicy: "Integer",
	VersionHash: "String",
} satisfies TableSchema;

type AssetTableDataType = TableType<typeof AssetTableSchema>;

type Metadata = Record<string, AssetTableDataType>;

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
			const json: AssetTableDataType = row.toJSON(AssetTableSchema);

			if (json.Ref && checkNeedDownload(meta[json.BundleName], json, force)) {
				try {
					if (await downloadCallback(json.BundleName, json.Ref)) {
						meta[json.BundleName] = json;
					}
				} catch (error) {
					logger.error(`processing ${json.BundleName} error:`, error);
					debugger;
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

function checkNeedDownload(
	oldMeta: AssetTableDataType | undefined,
	newMeta: AssetTableDataType,
	force?: boolean,
) {
	if (force) {
		return true;
	}
	if (oldMeta?.VersionHash === newMeta.VersionHash) {
		logger.debug(`${newMeta.BundleName} not changed. skip`);
		return false;
	}

	// migration
	const oldVersionMeta = oldMeta as any as AssetDataRaw;
	if (oldVersionMeta && oldVersionMeta.H === newMeta.Ref?.H) {
		logger.debug(`${newMeta.BundleName} not changed. skip`);
		return false;
	}

	return true;
}
