import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationExploreBuildingName } from "../localization";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { range } from "../utils";
import { item2wiki } from "../wiki-item";

const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");

export default function wikiExploreBuilding() {
	let out = wikiH1("探索建築");

	const buildings = _.groupBy(ExploreBuildingTable.rows, (r) => r.get("type"));
	for (const [type, building] of Object.entries(buildings)) {
		const table: WikiTableStruct = [];
		switch (type) {
			case "Warehouse":
				table.push([`! 倉庫等級`, `! 倉庫格數`, `! 升級素材`]);
				break;
			default:
				table.push([`! 等級`, `! 升級素材`]);
				break;
		}
		for (const level of building) {
			const items = range(1, 4)
				.map((i) =>
					item2wiki(level.get(`item${i}Id`), level.get(`item${i}Count`), true, {
						size: "20px",
					})
				)
				.filter(Boolean);
			table.push([
				{
					attributes: `style="text-align:center"`,
					text: `Lv ${level.get("level")}`,
				},
				...(type === "Warehouse"
					? [
							{
								attributes: `style="text-align:center"`,
								text: level.get("effectValue"),
							},
					  ]
					: []),
				...(items.length > 0
					? [
							{
								text: items.join(" "),
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
