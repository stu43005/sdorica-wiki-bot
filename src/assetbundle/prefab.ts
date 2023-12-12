import { parse as parseJson } from "lossless-json";
import fsp from "node:fs/promises";
import { P, match } from "ts-pattern";
import { Logger } from "../logger.js";
import { ABAsset } from "./asset-list.js";
import { addAsset, pathIdMappingContainer, prefabMappingSprite } from "./asset.js";

const logger = new Logger("prefab");

export function filterPrefab(abAsset: ABAsset): boolean {
	if (abAsset.Container.endsWith(".prefab")) {
		if (abAsset.Type["#text"] === "MonoBehaviour" && abAsset.Name === "Image") {
			return true;
		}
		return false;
	}
	return true;
}

export async function parsePrefab(
	bundleName: string,
	abAsset: ABAsset,
	assetFilePath: string,
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
			}),
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
	debugger;
	logger.error(
		`[parsePrefab][${bundleName}] parse ${abAsset.Container} (${abAsset.PathID}) failed.`,
	);
	return false;
}
