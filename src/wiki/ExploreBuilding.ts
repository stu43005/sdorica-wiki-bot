import * as _ from "lodash-es";
import { localizationExploreBuildingName } from "../localization.js";
import { ExploreBuildingType } from "../model/enums/explore-building-type.enum.js";
import { ExploreBuilding } from "../model/explore-building.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";

export default function wikiExploreBuilding() {
	let out = wikiH1("探索建築");

	const buildings = _.groupBy(ExploreBuilding.getAll(), (r) => r.type);
	for (const [type, building] of Object.entries(buildings)) {
		const table: WikiTableStruct = [];
		switch (type) {
			case ExploreBuildingType.Warehouse:
				table.push([`! 倉庫等級`, `! 倉庫格數`, `! 升級素材`]);
				break;
			default:
				table.push([`! 等級`, `! 升級素材`]);
				break;
		}
		for (const level of building) {
			table.push([
				{
					attributes: `style="text-align:center"`,
					text: `Lv ${level.level}`,
				},
				...(type === ExploreBuildingType.Warehouse
					? [
							{
								attributes: `style="text-align:center"`,
								text: level.storageSize,
							},
					  ]
					: []),
				...(level.levelUpItems.length > 0
					? [
							{
								text: level.levelUpItems.map((ref) => ref.toWiki()).join(" "),
							},
					  ]
					: [
							{
								attributes: `style="text-align:center"`,
								text: "-",
							},
					  ]),
			]);
		}

		out += `\n\n${wikiH2(localizationExploreBuildingName()(type))}\n${wikitable(table)}`;
	}

	return out;
}
