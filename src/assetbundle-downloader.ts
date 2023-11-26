import { XMLParser } from "fast-xml-parser";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import pMap from "p-map";
import { execAssetStudioModCLI } from "./asset-studio-cli";
import {
	IMAGE_FORMAT,
	filterAsset,
	getAssetPath,
	getNeedUploadBundleList,
	updateNeedUpdateList,
} from "./assetbundle-filter";
import { AssetbundleLookupTable } from "./assetbundle-lookup-table";
import { AssetbundleMapping } from "./assetbundle-mapping";
import { ASSETBUNDLE_PATH } from "./config";
import { assetDownload } from "./imperium-asset-download";
import { ImperiumData } from "./imperium-data";
import { inputDir } from "./input";
import { Logger } from "./logger";
import { mkdir, outJson, rpFile } from "./out";
import { SetFile } from "./out-set-file";

const logger = new Logger("assetbundle-downloader");
const metadataFilePath = path.join(ASSETBUNDLE_PATH, "metadata.json");
const downloadFolder = path.join(ASSETBUNDLE_PATH, "download");
const extractFolder = path.join(ASSETBUNDLE_PATH, "extract");
const uploadFolder = path.join(ASSETBUNDLE_PATH, "upload");

export const uploadedAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "uploaded_assets.json")
);
export const needUploadAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "need_upload_assets.json")
);
const ignoredAssets = new SetFile<string>(path.join(ASSETBUNDLE_PATH, "ignored_assets.json"));

export async function assetBundleDownloader(force = false): Promise<boolean> {
	await mkdir(uploadFolder);

	await AssetbundleLookupTable.getInstance().updateLookupTable();
	updateNeedUpdateList();

	for (const imperiumName of ["android", "androidExp"]) {
		const imperium = ImperiumData.from(imperiumName);
		await assetDownload(metadataFilePath, imperium, force, async (name, asset) =>
			processAsset(name, asset.L, (abAsset) => {
				AssetbundleMapping.getInstance().set(abAsset.Container, name, asset);
				return filterAsset(abAsset.Container);
			}).catch((error) => {
				logger.error(`${name}:`, error);
				debugger;
				process.exit(1);
			})
		);
	}

	logger.info("check need upload list");
	await pMap(
		getNeedUploadBundleList().values(),
		async ({ mapping, containerPaths }) => {
			try {
				await processAsset(
					path.join(mapping.uuid, mapping.bundleName),
					mapping.url,
					(abAsset) => containerPaths.has(abAsset.Container)
				);
			} catch (error) {
				logger.error(`processing ${name} error:`, error);
			}
		},
		{
			concurrency: 10,
		}
	);

	return true;
}

async function processAsset(
	name: string,
	assetUrl: string,
	assetFilter: (abAsset: ABAsset) => boolean
): Promise<boolean> {
	switch (true) {
		case name.endsWith(".ab"): {
			const filePath = await downloadAsset(name, assetUrl);
			const assetList = await getAssetList(name, filePath);
			for (const abAsset of assetList) {
				if (assetFilter(abAsset)) {
					const assetFilePath = await extractAssetBundleByPathId(
						name,
						filePath,
						abAsset.PathID
					);
					if (assetFilePath) {
						const assetPath = getAssetPath(abAsset.Container);
						const dist = path.join(uploadFolder, assetPath);
						await mkdir(path.dirname(dist));
						await fsp.cp(assetFilePath, dist);
						uploadedAssets.add(abAsset.Container);
						needUploadAssets.delete(abAsset.Container);
						logger.info(`upload ${abAsset.Container}`);
					}
				}
			}
			await fsp.unlink(filePath);
			break;
		}
		case name.endsWith(".mp4"): {
			const filePath = await downloadAsset(name, assetUrl);
			const dist = path.join(uploadFolder, "resources", path.basename(name));
			await mkdir(path.dirname(dist));
			await fsp.cp(filePath, dist);
			await fsp.unlink(filePath);
			logger.info(`upload ${name}`);
			break;
		}
		default: {
			logger.info(`ignore ${name}`);
			ignoredAssets.add(name);
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
	const args = [
		filePath,
		"--output",
		outDir,
		"--group-option",
		"none",
		"--filter-by-pathid",
		pathId,
		"--image-format",
		IMAGE_FORMAT,
	];
	await execAssetStudioModCLI(args, timeout);
	for await (const { filepath } of inputDir(outDir)) {
		return filepath;
	}
}

async function getAssetList(name: string, filePath: string): Promise<ABAsset[]> {
	const outDir = path.join(extractFolder, name);
	const timeout = AbortSignal.timeout(600_000);
	const args = [filePath, "--output", outDir, "--mode", "info", "--export-asset-list", "xml"];
	await execAssetStudioModCLI(args, timeout);
	const assetsListPath = path.join(outDir, "assets.xml");
	const assetList = await parseAssetList(assetsListPath);
	return assetList.filter((abAsset) => {
		const hasTexture2D = assetList
			.filter((a) => a !== abAsset && a.Container === abAsset.Container)
			.some((a) => a.Type["#text"] === "Texture2D");
		if (hasTexture2D) {
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
			const name = (asset.Name && `${asset.Name}`.toLowerCase()) ?? asset.PathID.toString();
			return {
				...asset,
				Name: name,
				Container: asset.Container?.toLowerCase() ?? `assets/${name}`,
				PathID: asset.PathID.toString(),
			};
		}) ?? []
	);
}
