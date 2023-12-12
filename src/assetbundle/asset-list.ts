import { XMLParser } from "fast-xml-parser";
import fsp from "node:fs/promises";
import path from "node:path";
import { outJson } from "../out.js";
import { extractAssetList } from "./extract-bundle.js";

const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@",
	isArray: (name, jpath) => {
		return ["Assets.Asset"].indexOf(jpath) !== -1;
	},
});

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

export async function getAssetList(name: string, filePath: string): Promise<ABAsset[]> {
	const assetsListPath = await extractAssetList(name, filePath);
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
