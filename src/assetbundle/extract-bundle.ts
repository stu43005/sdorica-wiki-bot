import path from "node:path";
import { BUNDLE_EXTRACT_PATH } from "../config.js";
import { inputDir } from "../input.js";
import { getAssetList } from "./asset-list.js";
import { CLIOptions, execAssetStudioModCLI } from "./asset-studio-cli.js";
import { IMAGE_FORMAT } from "./asset.js";

const cliTimeout = 600_000;

export async function extractAssetList(name: string, filePath: string): Promise<string> {
	const outDir = path.join(BUNDLE_EXTRACT_PATH, name);
	const timeout = AbortSignal.timeout(cliTimeout);
	await execAssetStudioModCLI(filePath, {
		output: outDir,
		mode: "info",
		exportAssetList: "xml",
		signal: timeout,
	});
	const assetsListPath = path.join(outDir, "assets.xml");
	return assetsListPath;
}

export async function extractAssetBundleByContainerPath(
	name: string,
	filePath: string,
	containerPath: string,
	imageFormat?: CLIOptions["imageFormat"],
): Promise<string | undefined> {
	containerPath = containerPath.toLowerCase();
	const assetList = await getAssetList(name, filePath);
	const abAsset = assetList.find((a) => a.Container === containerPath);
	if (abAsset) {
		const assetFilePath = await extractAssetBundleByPathId(
			name,
			filePath,
			abAsset.PathID,
			imageFormat,
		);
		if (assetFilePath) {
			return assetFilePath;
		}
	}
	return;
}

export async function extractAssetBundleByPathId(
	name: string,
	filePath: string,
	pathId: string,
	imageFormat: CLIOptions["imageFormat"] = IMAGE_FORMAT,
): Promise<string | undefined> {
	const outDir = path.join(BUNDLE_EXTRACT_PATH, name, pathId);
	const timeout = AbortSignal.timeout(cliTimeout);
	await execAssetStudioModCLI(filePath, {
		output: outDir,
		groupOption: "none",
		filterByPathId: [pathId],
		imageFormat: imageFormat,
		signal: timeout,
	});
	for await (const { filepath } of inputDir(outDir)) {
		return filepath;
	}
	return;
}
