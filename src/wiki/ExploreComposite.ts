import { ImperiumData } from "../imperium-data";
import { item2wiki, itemList } from "../wiki-item";

const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");
const ExploreCompositeTable = ImperiumData.fromGamedata().getTable("ExploreComposite");

export default function wikiExploreComposite() {
	const out: string[] = [];

	for (let i = 0; i < ExploreBuildingTable.length; i++) {
		const building = ExploreBuildingTable.get(i);
		const composites = ExploreCompositeTable.filter(comp => comp.get("requireBuildingId") == building.get("id") && comp.get("enable"));
		let str = `==${building.get("type")} Lv ${building.get("level")}==

{| class="wikitable"
! 設施等級 !! 道具名稱 !! 合成素材 !! 合成條件
`;
		for (let j = 0; j < composites.length; j++) {
			const row = composites[j];
			const items = itemList(row);
			const reset = row.get("resetDay") != -1 ? `<br/>(${row.get("maxCount")}次/${row.get("resetDay")}日)` : "";
			str += `|-
| style="text-align:center" | Lv ${building.get("level")}
| ${item2wiki(row.get("itemId"), undefined, true)}${reset}
| ${items.join(" ")}
| ${row.get("requireFlagId") ? `style="text-align: center" | {{?}}` : `style="text-align: center" | -`}
`;
		}
		str += `|}`;
		if (composites.length) {
			out.push(str);
		}
	}

	const otherComposites = ExploreCompositeTable.filter(comp => !comp.get("enable"));
	if (otherComposites.length > 0) {
		let str = `==其他停用製作項目==

{| class="wikitable"
! 設施 !! 道具名稱 !! 合成素材 !! 合成條件
`;
		for (let j = 0; j < otherComposites.length; j++) {
			const row = otherComposites[j];
			if (Number(row.get("itemId")) >= 1 && Number(row.get("itemId")) <= 11) continue;
			const items = itemList(row);
			const reset = row.get("resetDay") != -1 ? `<br/>(${row.get("maxCount")}次/${row.get("resetDay")}日)` : "";
			const building = ExploreBuildingTable.find(b => b.get("id") == row.get("requireBuildingId"));
			str += `|-
| style="text-align:center" | ${building ? `${building.get("type")} Lv ${building.get("level")}` : row.get("requireBuildingId")}
| ${item2wiki(row.get("itemId"), undefined, true)}${reset}
| ${items.join(" ")}
| ${row.get("requireFlagId") ? `style="text-align: center" | {{?}}` : `style="text-align: center" | -`}
`;
		}
		str += `|}`;
		out.push(str);
	}

	return out.join("\n\n------------------------------\n\n");
}
