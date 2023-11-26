import * as chardet from "chardet";
import extract from "extract-zip";
import * as iconv from "iconv-lite";
import fetch from "node-fetch";
import { spawn } from "node:child_process";
import fsp from "node:fs/promises";
import path from "node:path";
import { Logger } from "./logger";
import { rpFile } from "./out";
import pLimit from "p-limit";

const logger = new Logger("asset-studio-cli");
const CLI_DIR = path.join(__dirname, "../tools/AssetStudioModCLI");
const CLI_VERSION = path.join(CLI_DIR, "VERSION");
const CLI_DLL = path.join(CLI_DIR, "AssetStudioModCLI.dll");

async function getLatestRelease(
	user: string,
	repo: string,
	filterRelease: (release: any) => boolean,
	filterAsset: (asset: any) => boolean
) {
	const res = await fetch(`https://api.github.com/repos/${user}/${repo}/releases`);
	const releases = await res.json();
	const filtered = releases.filter(filterRelease);
	if (!filtered.length) {
		return null;
	}
	for (let i = 0; i < filtered.length; i++) {
		const release = filtered[i];
		const assets = release.assets.filter(filterAsset);

		if (assets.length) {
			return Object.assign({}, release, { assets });
		}
	}
	return null;
}

async function downloadCli(): Promise<boolean> {
	logger.info("Checking for updates of AssetStudioMod...");
	const release = await getLatestRelease(
		"aelurum",
		"AssetStudio",
		(release) =>
			release.target_commitish === "AssetStudioMod" && !release.draft && !release.prerelease,
		(asset) => asset.name === "AssetStudioModCLI_net7_portable.zip"
	);

	// check update
	try {
		const version = await fsp.readFile(CLI_VERSION, { encoding: "utf8" });
		if (release.tag_name === version) return true;
	} catch (error) {}

	const asset = release?.assets[0];
	const assetUrl: string | undefined = asset?.browser_download_url;
	if (assetUrl) {
		logger.info(`Downloading ${assetUrl}`);
		const destf = path.join(CLI_DIR, asset.name);
		try {
			await rpFile(assetUrl, destf);
		} catch (error) {
			logger.error("[DownloadCli] download error:", error);
			return false;
		}
		try {
			await extract(destf, {
				dir: CLI_DIR,
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
		logger.error("[DownloadCli] release not found.");
		return false;
	}
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
	}
): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const child = spawn(exe, args, {
			signal,
			cwd: path.join(__dirname, ".."),
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
			if (verbose || printStdout) {
				for (const msg of formatOutput(data)) {
					logger.info(msg);
				}
			}
		});
		child.stderr.on("data", (data) => {
			if (verbose || printStderr) {
				for (const msg of formatOutput(data)) {
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
			resolve(code ?? 0);
		});
	});
}

let cliDownloaded = false;
const limit = pLimit(1);

export async function execAssetStudioModCLI(args: string[], signal: AbortSignal) {
	await limit(async () => {
		if (!cliDownloaded) {
			cliDownloaded = await downloadCli();
		}
	});
	await spawnAsync("dotnet", [CLI_DLL, ...args], { signal, verbose: false });
}
