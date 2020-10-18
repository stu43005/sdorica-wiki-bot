import { ImperiumData } from "../imperium-data";
import { itemList } from "../wiki-item";

const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");

export default function wikiExploreBuilding() {
	const buildings = [...new Set(ExploreBuildingTable.rows.map(row => row.get('type')))];
	const out: string[] = [];

	for (const type of buildings) {
		let str = `==${type}==\n\n{| class="wikitable"\n`;
		switch (type) {
			case "Warehouse":
				str += `! 倉庫等級 !! 倉庫格數 !! 升級素材\n`;
				break;
			default:
				str += `! 等級 !! 升級素材\n`;
				break;
		}
		const bs = ExploreBuildingTable.filter(c => c.get("type") == type);
		for (let i = 0; i < bs.length; i++) {
			const row = bs[i];
			const items = itemList(row);
			switch (type) {
				case "Warehouse":
					str += `|-
| style="text-align:center" | Lv ${row.get("level")}
| style="text-align:center" | ${row.get("effectValue")}
| ${items.length > 0 ? items.join(" ") : `style="text-align:center" | -`}
`;
					break;
				default:
					str += `|-
| style="text-align:center" | Lv ${row.get("level")}
| ${items.length > 0 ? items.join(" ") : `style="text-align:center" | -`}
`;
					break;
			}
		}
		str += `|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
