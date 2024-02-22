import fsp from "node:fs/promises";
import path from "node:path";
import picomatch from "picomatch";
import sharp from "sharp";
import { ASSETBUNDLE_PATH } from "../config.js";
import { localizationCharacterName } from "../localization.js";
import { Logger } from "../logger.js";
import { MapFile } from "../out-map-file.js";
import { fileBasename } from "../out.js";
import type { ABAsset } from "./asset-list.js";
import { getAssetPath, needUploadAssets, replaceExtname } from "./asset.js";
import { SkeletonBinary } from "./skeleton-binary.js";

const logger = new Logger("spine");

type AtlasInfo = {
	filename: string;
	width: number;
	height: number;
};
type SpineInfo = {
	name?: string;
	atlas?: AtlasInfo;
	atlasPath?: string;
	skelPath?: string;
	skelBytesPath?: string;
};
const spineInfos = new MapFile<SpineInfo>(path.join(ASSETBUNDLE_PATH, "spine_infos.json"));

const spineGlob = `assets/game/character/spinedata/**/*.@(png|atlas.txt|skel.bytes)`;
const atlasRegexp = /\n(?<filename>.*?.png)\nsize: ?(?<width>\d+),(?<height>\d+)/;

export function isSpineAsset(containerPath: string): boolean {
	return picomatch.isMatch(containerPath, spineGlob, {
		nocase: true,
	});
}

function getSpineKey(containerPath: string): string {
	const spinePath = containerPath.replace("assets/game/character/spinedata/", "");
	return path.dirname(spinePath);
}

function getAtlasSize(content: string): AtlasInfo | null {
	const match = content.match(atlasRegexp);
	if (match && match.groups) {
		const atlas: AtlasInfo = {
			filename: match.groups["filename"],
			width: +match.groups["width"],
			height: +match.groups["height"],
		};
		return atlas;
	}
	return null;
}

export async function parseAtlas(
	bundleName: string,
	abAsset: ABAsset,
	assetFilePath: string,
): Promise<boolean> {
	const spineKey = getSpineKey(abAsset.Container);
	const content = await fsp.readFile(assetFilePath, { encoding: "utf8" });
	const atlas = getAtlasSize(content);
	if (atlas) {
		// replace filename to lowercase
		const lowerCaseName = atlas.filename.toLowerCase();
		if (atlas.filename !== lowerCaseName) {
			const content2 = content.replace(atlas.filename, lowerCaseName);
			await fsp.writeFile(assetFilePath, content2, { encoding: "utf8" });
			atlas.filename = lowerCaseName;
		}

		logger.info(`[parseAtlas] parsed ${spineKey}: ${JSON.stringify(atlas)}`);
		const characterName = [
			spineKey,
			fileBasename(atlas.filename),
			...spineKey.split("/").reverse(),
		]
			.map(localizationCharacterName(true))
			.filter(Boolean);
		spineInfos.set(spineKey, {
			...spineInfos.get(spineKey),
			atlas: atlas,
			atlasPath: getAssetPath(abAsset.Container),
			name: characterName[0],
		});
		needUploadAssets.add(
			path.posix.join(path.dirname(abAsset.Container), atlas.filename.toLowerCase()),
		);
		return true;
	}
	debugger;
	logger.error(
		`[parseAtlas][${bundleName}] parse ${abAsset.Container} (${abAsset.PathID}) failed.`,
	);
	return false;
}

export async function parseSkel(
	bundleName: string,
	abAsset: ABAsset,
	assetFilePath: string,
): Promise<{
	jsonFilePath: string;
	jsonContainerPath: string;
}> {
	const spineKey = getSpineKey(abAsset.Container);
	const buf = await fsp.readFile(assetFilePath);
	const skel = new SkeletonBinary(3.7);
	const json = skel.readSkeletonJson(buf);
	const jsonFilePath = path.join(path.dirname(assetFilePath), "skel.json");
	const jsonContainerPath = getAssetPath(replaceExtname(abAsset.Container, ".json"));
	await fsp.writeFile(jsonFilePath, JSON.stringify(json), { encoding: "utf8" });
	logger.info(`[parseSkel] parsed ${spineKey}`);
	spineInfos.set(spineKey, {
		...spineInfos.get(spineKey),
		skelPath: jsonContainerPath,
		skelBytesPath: getAssetPath(abAsset.Container),
	});
	return {
		jsonFilePath,
		jsonContainerPath,
	};
}

export async function resizeSpineTexture(
	bundleName: string,
	abAsset: ABAsset,
	assetFilePath: string,
): Promise<string | undefined> {
	const spineKey = getSpineKey(abAsset.Container);
	const spine = spineInfos.get(spineKey);
	if (spine?.atlas) {
		const resizedFilePath = path.join(
			path.dirname(assetFilePath),
			`resized_${path.basename(assetFilePath)}`,
		);
		await resizeImage(spine.atlas, assetFilePath, resizedFilePath);
		logger.info(`[resizeSpineTexture] resized spine image ${spineKey}`);
		return resizedFilePath;
	}
	logger.info(`[resizeSpineTexture] no atlas info ${spineKey}`);
	return;
}

function resizeImage(atlas: AtlasInfo, inputPath: string, outPath: string) {
	return sharp(inputPath).resize(atlas.width, atlas.height).toFile(outPath);
}
