import { XMLParser } from "fast-xml-parser";
import JSZip from "jszip";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import pMap from "p-map";
import pWaterfall from "p-waterfall";
import { promisify } from "util";
import { unzip } from "zlib";
import { execAssetStudioModCLI } from "./asset-studio-cli";
import {
	IMAGE_FORMAT,
	addAsset,
	assetbundleMapping,
	getAssetPath,
	ignoredAssets,
	needUploadAssets,
	pathIdMappingContainer,
	prefabMappingSprite,
	uploadedAssets,
} from "./assetbundle-asset";
import { filterAsset, getNeedUploadBundleList, updateNeedUpdateList } from "./assetbundle-filter";
import { AssetbundleLookupTable } from "./assetbundle-lookup-table";
import { ASSETBUNDLE_PATH } from "./config";
import { assetDownload } from "./imperium-asset-download";
import { ImperiumData } from "./imperium-data";
import { inputDir } from "./input";
import { Logger } from "./logger";
import { mkdir, outJson, rpFile } from "./out";
import { siJsonParse } from "./viewerjs/utils";
import { parse as parseJson } from "lossless-json";
import { P, match } from "ts-pattern";

const doUnzip = promisify(unzip);

const logger = new Logger("assetbundle-downloader");
const metadataFilePath = path.join(ASSETBUNDLE_PATH, "metadata.json");
const downloadFolder = path.join(ASSETBUNDLE_PATH, "download");
const extractFolder = path.join(ASSETBUNDLE_PATH, "extract");
const uploadFolder = path.join(ASSETBUNDLE_PATH, "upload");

export async function assetBundleDownloader(force = false): Promise<boolean> {
	await mkdir(uploadFolder);

	logger.info("update assetbundle lookup table");
	await AssetbundleLookupTable.getInstance().updateLookupTable();
	updateNeedUpdateList();

	for (const imperiumName of ["android", "androidExp"]) {
		logger.info(`check '${imperiumName}' update`);
		const imperium = ImperiumData.from(imperiumName);
		await assetDownload(metadataFilePath, imperium, force, async (name, asset) =>
			processAsset(name, asset.L, (abAsset) => {
				assetbundleMapping.set(abAsset.Container, {
					bundleName: name,
					uuid: asset.I,
					url: asset.L,
				});
				pathIdMappingContainer.set(abAsset.PathID, abAsset.Container);
				return filterAsset(abAsset.Container) && filterPrefab(abAsset);
			}).catch((error) => {
				logger.error(`${name}:`, error);
				debugger;
				process.exit(1);
			})
		);
	}

	logger.info("check need upload list");
	updateNeedUpdateList();
	await pMap(
		getNeedUploadBundleList().values(),
		async ({ mapping, containerPaths }) => {
			try {
				await processAsset(
					path.join(mapping.uuid, mapping.bundleName),
					mapping.url,
					(abAsset) => containerPaths.has(abAsset.Container) && filterPrefab(abAsset)
				);
			} catch (error) {
				logger.error(`processing ${mapping.bundleName} error:`, error);
			}
		},
		{
			concurrency: 10,
		}
	);

	return true;
}

async function processAsset(
	bundleName: string,
	assetUrl: string,
	assetFilter: (abAsset: ABAsset) => boolean
): Promise<boolean> {
	switch (true) {
		case bundleName.endsWith(".ab"): {
			const filePath = await downloadAsset(bundleName, assetUrl);
			const assetList = await getAssetList(bundleName, filePath);
			for (const abAsset of assetList) {
				if (assetFilter(abAsset)) {
					logger.debug(`[${bundleName}] extracting asset file ${abAsset.Container}...`);
					const assetFilePath = await extractAssetBundleByPathId(
						bundleName,
						filePath,
						abAsset.PathID
					);
					if (assetFilePath) {
						let uploadSuccess = false;
						if (abAsset.Container.endsWith(".prefab")) {
							uploadSuccess = await parsePrefab(bundleName, assetFilePath, abAsset);
						} else {
							const assetPath = getAssetPath(abAsset.Container);
							const dist = path.join(uploadFolder, assetPath);
							await mkdir(path.dirname(dist));
							await fsp.cp(assetFilePath, dist);
							uploadSuccess = true;
							logger.info(`upload ${abAsset.Container}`);
						}
						if (uploadSuccess) {
							uploadedAssets.add(abAsset.Container);
							needUploadAssets.delete(abAsset.Container);
						}
					} else {
						logger.error(
							`[${bundleName}] extract asset ${abAsset.Container} (${abAsset.PathID}) failed.`
						);
					}
				} else {
					logger.debug(`[${bundleName}] skip asset file ${abAsset.Container}`);
				}
			}
			await fsp.unlink(filePath);
			// await fsp.rm(path.join(extractFolder, bundleName), { recursive: true, force: true });
			break;
		}
		case bundleName.endsWith(".mp4"): {
			const filePath = await downloadAsset(bundleName, assetUrl);
			const dist = path.join(uploadFolder, "resources", path.basename(bundleName));
			await mkdir(path.dirname(dist));
			await fsp.cp(filePath, dist);
			await fsp.unlink(filePath);
			logger.info(`upload ${bundleName}`);
			break;
		}
		case bundleName === "BundleDependencyTable.zip": {
			await downloadBundleDependencyTable(bundleName, assetUrl);
			break;
		}
		default: {
			logger.info(`ignore ${bundleName}`);
			ignoredAssets.add(bundleName);
			return false;
		}
	}
	return true;
}

export async function downloadAsset(name: string, assetUrl: string): Promise<string> {
	const filePath = path.join(downloadFolder, name);
	logger.info(`downloading ${name}...`);
	await rpFile(assetUrl, filePath);
	return filePath;
}

export async function extractAssetBundleByContainerPath(
	name: string,
	filePath: string,
	containerPath: string
) {
	containerPath = containerPath.toLowerCase();
	const assetList = await getAssetList(name, filePath);
	const abAsset = assetList.find((a) => a.Container === containerPath);
	if (abAsset) {
		const assetFilePath = await extractAssetBundleByPathId(name, filePath, abAsset.PathID);
		if (assetFilePath) {
			return assetFilePath;
		}
	}
}

async function extractAssetBundleByPathId(name: string, filePath: string, pathId: string) {
	const outDir = path.join(extractFolder, name, pathId);
	const timeout = AbortSignal.timeout(600_000);
	await execAssetStudioModCLI(filePath, {
		output: outDir,
		groupOption: "none",
		filterByPathId: [pathId],
		imageFormat: IMAGE_FORMAT,
		signal: timeout,
	});
	for await (const { filepath } of inputDir(outDir)) {
		return filepath;
	}
}

async function getAssetList(name: string, filePath: string): Promise<ABAsset[]> {
	const outDir = path.join(extractFolder, name);
	const timeout = AbortSignal.timeout(600_000);
	await execAssetStudioModCLI(filePath, {
		output: outDir,
		mode: "info",
		exportAssetList: "xml",
		signal: timeout,
	});
	const assetsListPath = path.join(outDir, "assets.xml");
	const assetList = await parseAssetList(assetsListPath);
	return assetList.filter((abAsset) => {
		const hasSprite = assetList
			.filter((a) => a !== abAsset && a.Container === abAsset.Container)
			.some((a) => a.Type["#text"] === "Sprite");
		if (hasSprite) {
			return false;
		}
		return true;
	});
}

export interface ABAsset {
	Container: string;
	Name: string;
	PathID: string;
	Size: number;
	Source: string;
	Type: {
		"#text": string;
		"@id": string;
	};
}

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@",
	isArray: (name, jpath) => {
		return ["Assets.Asset"].indexOf(jpath) !== -1;
	},
});

async function parseAssetList(xmlListPath: string): Promise<ABAsset[]> {
	const xmlContent = await fsp.readFile(xmlListPath, { encoding: "utf8" });
	const json = xmlParser.parse(xmlContent);
	const jsonListPath = path.join(path.dirname(xmlListPath), "assets.json");
	await outJson(jsonListPath, json);
	return (
		json.Assets?.Asset?.map((asset: ABAsset): ABAsset => {
			const name = asset.Name ?? asset.PathID.toString();
			return {
				...asset,
				Name: name,
				Container: asset.Container?.toLowerCase() ?? `assets/${name.toLowerCase()}`,
				PathID: asset.PathID.toString(),
			};
		}) ?? []
	);
}

async function downloadBundleDependencyTable(name: string, assetUrl: string) {
	const filePath = await downloadAsset(name, assetUrl);
	const outDir = path.join(extractFolder, name);

	const zip = await pWaterfall(
		[(filePath) => fsp.readFile(filePath), (data) => JSZip.loadAsync(data)],
		filePath
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
				zipEntry
			);
			const jsonFilePath = path.join(outDir, zipEntry.name.replace(/\.[^\.]+$/, ".json"));
			await outJson(jsonFilePath, data);
		} catch (error) {}
	}
	await fsp.unlink(filePath);
}

function filterPrefab(abAsset: ABAsset): boolean {
	if (abAsset.Container.endsWith(".prefab")) {
		if (abAsset.Type["#text"] === "MonoBehaviour" && abAsset.Name === "Image") {
			return true;
		}
		return false;
	}
	return true;
}

async function parsePrefab(
	bundleName: string,
	assetFilePath: string,
	abAsset: ABAsset
): Promise<boolean> {
	const content = await fsp.readFile(assetFilePath, { encoding: "utf8" });
	const data = match(parseJson(content))
		.with(
			{
				m_Sprite: {
					m_FileID: P.select("fileId"),
					m_PathID: P.select("pathId"),
				},
			},
			({ fileId, pathId }) => ({
				fileId: Number(fileId),
				pathId: `${pathId}`,
			})
		)
		.otherwise(() => null);
	if (data) {
		if (!data.pathId || data.pathId === "0") {
			logger.info(`[parsePrefab] skiped ${abAsset.Container}`);
			return true;
		}
		prefabMappingSprite.set(abAsset.Container, data);
		const containerPath = pathIdMappingContainer.get(data.pathId);
		if (containerPath) {
			addAsset(containerPath);
		}
		logger.info(`[parsePrefab] parsed ${abAsset.Container}`);
		return true;
	}
	logger.error(
		`[parsePrefab][${bundleName}] parse ${abAsset.Container} (${abAsset.PathID}) failed.`
	);
	return false;
}
