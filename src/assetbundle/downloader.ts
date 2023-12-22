import JSZip from "jszip";
import fsp from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import pMap from "p-map";
import pWaterfall from "p-waterfall";
import { unzip } from "zlib";
import {
	ASSETBUNDLE_PATH,
	BUNDLE_DOWNLOAD_PATH,
	BUNDLE_EXTRACT_PATH,
	BUNDLE_UPLOAD_PATH,
} from "../config.js";
import { assetDownload } from "../imperium-asset-download.js";
import { ImperiumData } from "../imperium-data.js";
import { Logger } from "../logger.js";
import { outJson, rpFile } from "../out.js";
import { siJsonParse } from "../viewerjs/utils.js";
import { ABAsset, getAssetList } from "./asset-list.js";
import {
	IMAGE_FORMAT,
	assetbundleMapping,
	getAssetPath,
	ignoredAssets,
	needUploadAssets,
	pathIdMappingContainer,
	uploadedAssets,
} from "./asset.js";
import { AssetbundleLookupTable } from "./assetbundle-lookup-table.js";
import { extractAssetBundleByPathId } from "./extract-bundle.js";
import { filterAsset, getNeedUploadBundleList, updateNeedUpdateList } from "./filter.js";
import { filterPrefab, parsePrefab } from "./prefab.js";
import { isSpineAsset, parseAtlas, parseSkel, resizeSpineTexture } from "./spine.js";

const doUnzip = promisify(unzip);

const logger = new Logger("downloader");
const metadataFilePath = path.join(ASSETBUNDLE_PATH, "metadata.json");

export async function assetBundleDownloader(force = false): Promise<boolean> {
	await fsp.mkdir(BUNDLE_UPLOAD_PATH, {
		recursive: true,
	});
	let i = 0;

	logger.info(`[${++i}] update assetbundle lookup table`);
	await AssetbundleLookupTable.getInstance().updateLookupTable();
	logger.info(`[${++i}] update need upload list`);
	updateNeedUpdateList();

	for (const imperiumName of ["android", "androidExp"]) {
		logger.info(`[${++i}] check '${imperiumName}' update`);
		const imperium = ImperiumData.from(imperiumName);
		await assetDownload(metadataFilePath, imperium, force, async (bundleName, asset) =>
			processAssetBundle(bundleName, asset.L, (abAsset) => {
				assetbundleMapping.set(abAsset.Container, {
					bundleName: bundleName,
					uuid: asset.I,
					url: asset.L,
				});
				pathIdMappingContainer.set(abAsset.PathID, abAsset.Container);
				return filterAsset(abAsset.Container);
			}),
		);
	}

	logger.info(`[${++i}] update need upload list`);
	updateNeedUpdateList();
	logger.info(`[${++i}] check need upload`);
	let needUploadCount: number;
	do {
		needUploadCount = needUploadAssets.size;
		await pMap(
			getNeedUploadBundleList().values(),
			async ({ mapping, containerPaths }) => {
				try {
					await processAssetBundle(
						path.join(mapping.uuid, mapping.bundleName),
						mapping.url,
						(abAsset) => containerPaths.has(abAsset.Container),
					);
				} catch (error) {
					logger.error(`processing ${mapping.bundleName} error:`, error);
					debugger;
				}
			},
			{
				concurrency: 10,
			},
		);
	} while (needUploadAssets.size > 0 && needUploadCount !== needUploadAssets.size);

	return true;
}

async function processAssetBundle(
	bundleName: string,
	assetUrl: string,
	assetFilter: (abAsset: ABAsset) => boolean,
): Promise<boolean> {
	switch (true) {
		case ignoredAssets.has(bundleName): {
			break;
		}
		case bundleName.endsWith(".ab"): {
			const bundleFilePath = await downloadAssetBundle(bundleName, assetUrl);
			const assetList = await getAssetList(bundleName, bundleFilePath);
			for (const abAsset of assetList) {
				if (assetFilter(abAsset)) {
					let result: boolean | null = null;
					try {
						result = await processAsset(bundleName, bundleFilePath, abAsset);
					} catch (error) {
						result = false;
						logger.error(
							`[${bundleName}] process asset ${abAsset.Container} (${abAsset.PathID}) error:`,
							error,
						);
						debugger;
					}
					if (result === true) {
						uploadedAssets.add(abAsset.Container);
						needUploadAssets.delete(abAsset.Container);
					} else if (result === false) {
						needUploadAssets.add(abAsset.Container);
					} else {
						// skip
					}
				} else {
					logger.debug(
						`[${bundleName}] skip asset file ${abAsset.Container} (${abAsset.PathID})`,
					);
				}
			}
			await fsp.unlink(bundleFilePath);
			await fsp.rm(path.join(BUNDLE_EXTRACT_PATH, bundleName), {
				recursive: true,
				force: true,
			});
			return true;
		}
		case bundleName.endsWith(".mp4"): {
			const filePath = await downloadAssetBundle(bundleName, assetUrl);
			const dist = path.join(BUNDLE_UPLOAD_PATH, "resources", path.basename(bundleName));
			await fsp.mkdir(path.dirname(dist), {
				recursive: true,
			});
			await fsp.cp(filePath, dist);
			await fsp.unlink(filePath);
			logger.info(`upload ${bundleName}`);
			return true;
		}
		case bundleName === "BundleDependencyTable.zip": {
			await downloadBundleDependencyTable(bundleName, assetUrl);
			return true;
		}
		default: {
			logger.info(`ignore ${bundleName}`);
			ignoredAssets.add(bundleName);
			break;
		}
	}
	return false;
}

async function processAsset(
	bundleName: string,
	bundleFilePath: string,
	abAsset: ABAsset,
): Promise<boolean | null> {
	if (ignoredAssets.has(abAsset.Container) || !filterPrefab(abAsset)) {
		return null;
	}
	logger.debug(
		`[${bundleName}] extracting asset file ${abAsset.Container} (${abAsset.PathID})...`,
	);
	const spineAsset = isSpineAsset(abAsset.Container);
	const assetFilePath = await extractAssetBundleByPathId(
		bundleName,
		bundleFilePath,
		abAsset.PathID,
		spineAsset ? "png" : IMAGE_FORMAT,
	);
	if (assetFilePath) {
		switch (true) {
			case abAsset.Container.endsWith(".prefab"): {
				return await parsePrefab(bundleName, abAsset, assetFilePath);
			}
			case spineAsset && abAsset.Container.includes(".atlas"): {
				const result = await parseAtlas(bundleName, abAsset, assetFilePath);
				await uploadAsset(abAsset, assetFilePath);
				return result;
			}
			case spineAsset && abAsset.Container.includes(".skel"): {
				const jsonFilePath = await parseSkel(bundleName, abAsset, assetFilePath);
				await uploadAsset(abAsset, jsonFilePath);
				return true;
			}
			case spineAsset && abAsset.Container.includes(".png"): {
				const resizedFilePath = await resizeSpineTexture(
					bundleName,
					abAsset,
					assetFilePath,
				);
				if (resizedFilePath) {
					await uploadAsset(abAsset, resizedFilePath);
					return true;
				}
				return false;
			}
			default: {
				await uploadAsset(abAsset, assetFilePath);
				return true;
			}
		}
	} else {
		debugger;
		logger.error(
			`[${bundleName}] extract asset ${abAsset.Container} (${abAsset.PathID}) failed.`,
		);
	}
	return false;
}

async function uploadAsset(abAsset: ABAsset, assetFilePath: string): Promise<void> {
	const assetPath = getAssetPath(abAsset.Container);
	const dist = path.join(BUNDLE_UPLOAD_PATH, assetPath);
	await fsp.mkdir(path.dirname(dist), {
		recursive: true,
	});
	await fsp.cp(assetFilePath, dist);
	logger.info(`upload ${abAsset.Container}`);
}

export async function downloadAssetBundle(name: string, assetUrl: string): Promise<string> {
	const filePath = path.join(BUNDLE_DOWNLOAD_PATH, name);
	logger.info(`downloading ${name}...`);
	await rpFile(assetUrl, filePath);
	return filePath;
}

async function downloadBundleDependencyTable(name: string, assetUrl: string) {
	const filePath = await downloadAssetBundle(name, assetUrl);
	const outDir = path.join(BUNDLE_EXTRACT_PATH, name);

	const zip = await pWaterfall(
		[(filePath) => fsp.readFile(filePath), (data) => JSZip.loadAsync(data)],
		filePath,
	);

	for (const zipEntry of Object.values(zip.files)) {
		try {
			const data = await pWaterfall(
				[
					(zipEntry) => zipEntry.async("nodebuffer"),
					(buf) => doUnzip(buf),
					(buf) => buf.toString("utf8"),
					(jsonString) => siJsonParse(jsonString),
				],
				zipEntry,
			);
			const jsonFilePath = path.join(outDir, zipEntry.name.replace(/\.[^\.]+$/, ".json"));
			await outJson(jsonFilePath, data);
		} catch (error) {}
	}
	await fsp.unlink(filePath);
}
