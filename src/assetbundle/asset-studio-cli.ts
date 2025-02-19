import { Octokit } from "@octokit/core";
import * as chardet from "chardet";
import extract from "extract-zip";
import iconv from "iconv-lite";
import { spawn } from "node:child_process";
import fsp from "node:fs/promises";
import path from "node:path";
import pLimit from "p-limit";
import { ASSET_STUDIO_CLI_DIR } from "../config.js";
import { Logger } from "../logger.js";
import { rpFile } from "../out.js";

const logger = new Logger("asset-studio-cli");
const CLI_VERSION = path.join(ASSET_STUDIO_CLI_DIR, "VERSION");
const CLI_DLL = path.join(ASSET_STUDIO_CLI_DIR, "AssetStudioModCLI.dll");
const GITHUB_TOKEN = process.env["GITHUB_TOKEN"];

async function getLatestRelease(user: string, repo: string) {
	const octokit = new Octokit({ auth: GITHUB_TOKEN });
	const { data: release } = await octokit.request("GET /repos/{owner}/{repo}/releases/latest", {
		owner: user,
		repo: repo,
		headers: {
			"X-GitHub-Api-Version": "2022-11-28",
		},
	});
	return release;
}

async function downloadCli(): Promise<boolean> {
	logger.info("Checking for updates of AssetStudioMod...");
	const release = await getLatestRelease("aelurum", "AssetStudio");

	// check update
	try {
		const version = await fsp.readFile(CLI_VERSION, { encoding: "utf8" });
		if (release.tag_name === version) return true;
	} catch (error) {}

	const asset = release.assets.find(
		(asset) => asset.name === "AssetStudioModCLI_net8_portable.zip",
	);
	if (asset) {
		const assetUrl = asset.browser_download_url;
		logger.info(`Downloading ${assetUrl}`);
		const destf = path.join(ASSET_STUDIO_CLI_DIR, asset.name);
		try {
			await rpFile(assetUrl, destf);
		} catch (error) {
			logger.error("[DownloadCli] download error:", error);
			return false;
		}
		try {
			await extract(destf, {
				dir: ASSET_STUDIO_CLI_DIR,
			});
			await fsp.unlink(destf);
		} catch (error) {
			logger.error("[DownloadCli] extract error:", error);
			return false;
		}
		try {
			await fsp.writeFile(CLI_VERSION, release.tag_name, { encoding: "utf8" });
		} catch (error) {}
		logger.info("Successfully updated AssetStudioMod.");
		return true;
	} else {
		logger.error("[DownloadCli] release asset not found.");
		return false;
	}
}

function isMissingRuntimeMsg(msg: string) {
	return (
		msg.includes("You must install or update .NET to run this application.") &&
		msg.includes("app-launch-failed")
	);
}

function spawnAsync(
	exe: string,
	args: string[],
	{
		signal,
		verbose,
		printStdout,
		printStderr,
	}: {
		signal?: AbortSignal;
		verbose?: boolean;
		printStdout?: boolean;
		printStderr?: boolean;
	},
): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		let missingRuntime = false;
		const child = spawn(exe, args, {
			signal,
			cwd: ASSET_STUDIO_CLI_DIR,
		});
		const logger = new Logger(`childprocess][${child.pid}`);
		if (verbose) {
			logger.info(`# Spawn: ${exe} ${args.join(" ")}`);
		}
		function formatOutput(data: Buffer) {
			const str = iconv.decode(data, chardet.detect(data) ?? "utf8");
			const msgs = str
				.split(/\r?\n/)
				.map((s) => {
					return s
						.split(/\r/)
						.reduce<string[]>((acc, cur) => {
							Object.assign(acc, [...cur]);
							return acc;
						}, [])
						.join("");
				})
				.filter(Boolean);
			return msgs;
		}
		child.stdout.on("data", (data) => {
			for (const msg of formatOutput(data)) {
				if (isMissingRuntimeMsg(msg)) {
					missingRuntime = true;
				}
				if (verbose || printStdout || missingRuntime) {
					logger.info(msg);
				}
			}
		});
		child.stderr.on("data", (data) => {
			for (const msg of formatOutput(data)) {
				if (isMissingRuntimeMsg(msg)) {
					missingRuntime = true;
				}
				if (verbose || printStderr || missingRuntime) {
					logger.error(msg);
				}
			}
		});
		child.on("error", (err) => {
			logger.error(`# Error:`, err);
			reject(err);
		});
		child.on("close", (code) => {
			if (verbose) {
				logger.info(`# Exit with code: ${code}`);
			}
			if (code === 2147516566 || missingRuntime) {
				reject(new Error("You must install or update .NET to run this application."));
				return;
			}
			resolve(code ?? 0);
		});
	});
}

export interface CLIOptions {
	/**
	 * Specify working mode
	 * @default "export"
	 */
	mode?: "export" | "exportRaw" | "dump" | "info" | "live2d" | "splitObjects";
	/**
	 * Specify asset type(s) to export
	 * @default "all"
	 */
	assetType?: (
		| "tex2d"
		| "sprite"
		| "textAsset"
		| "monoBehaviour"
		| "font"
		| "shader"
		| "movieTexture"
		| "audio"
		| "video"
		| "mesh"
		| "all"
	)[];
	/**
	 * Specify the way in which exported assets should be grouped
	 * @default "container"
	 */
	groupOption?: "none" | "type" | "container" | "containerFull" | "filename";
	/**
	 * Specify the file name format for exported assets
	 */
	filenameFormat?: "assetName" | "assetName_pathID" | "pathID";
	/**
	 * Specify path to the output folder
	 */
	output?: string;
	/**
	 * Specify the log level
	 * @default "info"
	 */
	logLevel?: "verbose" | "debug" | "info" | "warning" | "error";
	/**
	 * Specify the format for converting image assets
	 * @default "png"
	 */
	imageFormat?: "none" | "jpg" | "png" | "bmp" | "tga" | "webp";
	/**
	 * Specify the format for converting audio assets
	 * @default "wav"
	 */
	audioFormat?: "none" | "wav";
	/**
	 * Specify the FBX Scale Factor
	 *
	 * Value: float number from 0 to 100 (default=1)
	 */
	fbxScaleFactor?: number;
	/**
	 * Specify the FBX Bone Size
	 *
	 * Value: integer number from 0 to 100 (default=10)
	 */
	fbxBoneSize?: number;
	/**
	 * Specify the name by which assets should be filtered
	 */
	filterByName?: string[];
	/**
	 * Specify the container by which assets should be filtered
	 */
	filterByContainer?: string[];
	/**
	 * Specify the PathID by which assets should be filtered
	 */
	filterByPathId?: string[];
	/**
	 * Specify the text by which assets should be filtered
	 *
	 * Looks for assets that contain the specified text in their names or containers
	 */
	filterByText?: string[];
	/**
	 * Specify the format in which you want to export asset list
	 * @default "none"
	 */
	exportAssetList?: "none" | "xml";
	/**
	 * Specify the path to the assembly folder
	 */
	assemblyFolder?: string;
	/**
	 * Specify Unity version
	 */
	unityVersion?: string;
	/**
	 * If specified, AssetStudio will not try to use/restore original TextAsset
	 * extension name, and will just export all TextAssets with the ".txt" extension
	 */
	notRestoreExtension?: boolean;
	/**
	 * If specified, AssetStudio will load assets of all types
	 * (Only for Dump, Info and ExportRaw modes)
	 */
	loadAll?: boolean;
}

function getCliArgs(options: CLIOptions) {
	const args: string[] = [];
	if (options.mode) args.push("--mode", options.mode);
	if (options.assetType) args.push("--asset-type", options.assetType.join(","));
	if (options.groupOption) args.push("--group-option", options.groupOption);
	if (options.filenameFormat) args.push("--filename-format", options.filenameFormat);
	if (options.output) args.push("--output", options.output);
	if (options.logLevel) args.push("--log-level", options.logLevel);
	if (options.imageFormat) args.push("--image-format", options.imageFormat);
	if (options.audioFormat) args.push("--audio-format", options.audioFormat);
	if (options.fbxScaleFactor) args.push("--fbx-scale-factor", options.fbxScaleFactor.toString());
	if (options.fbxBoneSize) args.push("--fbx-bone-size", options.fbxBoneSize.toString());
	if (options.filterByName) args.push("--filter-by-name", options.filterByName.join(","));
	if (options.filterByContainer)
		args.push("--filter-by-container", options.filterByContainer.join(","));
	if (options.filterByPathId) args.push("--filter-by-pathid", options.filterByPathId.join(","));
	if (options.filterByText) args.push("--filter-by-text", options.filterByText.join(","));
	if (options.exportAssetList) args.push("--export-asset-list", options.exportAssetList);
	if (options.assemblyFolder) args.push("--assembly-folder", options.assemblyFolder);
	if (options.unityVersion) args.push("--unity-version", options.unityVersion);
	if (options.notRestoreExtension) args.push("--not-restore-extension");
	if (options.loadAll) args.push("--load-all");
	return args;
}

let cliDownloaded = false;
const limit = pLimit(1);

export async function execAssetStudioModCLI(
	input: string,
	options: CLIOptions & {
		signal: AbortSignal;
		verbose?: boolean;
	},
) {
	await limit(async () => {
		if (!cliDownloaded) {
			cliDownloaded = await downloadCli();
		}
	});
	await spawnAsync(
		"dotnet",
		[
			CLI_DLL,
			input,
			...getCliArgs({
				logLevel: "debug",
				...options,
			}),
		],
		{
			signal: options.signal,
			verbose: options.verbose,
		},
	);
}
