import { ExploreBuilding } from "../model/explore-building.js";
import { ExploreComposite } from "../model/explore-composite.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";

export default function wikiExploreComposite() {
	let out = wikiH1("探索合成表");

	for (const building of ExploreBuilding) {
		if (!building.compositeItems.length) continue;

		const table: WikiTableStruct = [[`! 設施等級`, `! 道具名稱`, `! 合成素材`, `! 合成條件`]];
		for (const composite of building.compositeItems) {
			const reset =
				composite.resetDay != -1
					? `\n(${composite.maxCount}次/${composite.resetDay}日)`
					: "";

			table.push([
				{
					attributes: `style="text-align:center"`,
					text: `Lv.${building.level}`,
				},
				`${composite.item?.toWiki()}${reset}`,
				composite.materials.map((ref) => ref.toWiki()).join(" "),
				{
					attributes: `style="text-align: center"`,
					text: composite.requireFlagId || "-",
				},
			]);
		}

		out += `\n\n${wikiH2(building.nameLevel, building.id)}\n${wikitable(table)}`;
	}

	const disabledComposites = ExploreComposite.getDisabled();
	if (disabledComposites.length > 0) {
		const table: WikiTableStruct = [[`! 設施`, `! 道具名稱`, `! 合成素材`, `! 合成條件`]];
		for (const composite of disabledComposites) {
			if (!composite.item) continue;

			const reset =
				composite.resetDay != -1
					? `\n(${composite.maxCount}次/${composite.resetDay}日)`
					: "";

			table.push({
				attributes: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
				ceils: [
					{
						attributes: `style="text-align:center"`,
						text: composite.requireBuilding?.nameLevel ?? "",
					},
					`${composite.item?.toWiki()}${reset}`,
					composite.materials.map((ref) => ref.toWiki()).join(" "),
					{
						attributes: `style="text-align: center"`,
						text: composite.requireFlagId || "-",
					},
				],
			});
		}

		out += `\n\n${wikiH2("其他停用製作項目")}\n${wikitable(table)}`;
	}

	return out;
}
