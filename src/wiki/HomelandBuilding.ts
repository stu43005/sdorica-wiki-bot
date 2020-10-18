import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { arrayUnique } from "../utils";
import { itemListWithType } from "../wiki-item";

const HomelandBuildingTable = ImperiumData.fromGamedata().getTable("HomelandBuilding");

export default function wikiHomelandBuilding() {
	const homelandBuildingIds = arrayUnique(HomelandBuildingTable.rows.map(r => r.get("buildingId")));
	const out: string[] = [];
	homelandBuildingIds.forEach(id => {
		const buildings = HomelandBuildingTable.filter(r => r.get("buildingId") == id);
		let str = `==${localizationString("Homeland")(buildings[0].get("nameKey")) || buildings[0].get("nameKey")}==
{| class="wikitable"
! 等級<!--buildingLv-->
! 空間<!--spaceNum-->
! 升級素材
! 升級獲得營地精驗`;
		for (let i = 0; i < buildings.length; i++) {
			const building = buildings[i];
			const itemlist = itemListWithType(building, 3, (i) => `payType${i}`, (i) => `linkId${i}`, (i) => `amount${i}`).join(" ");
			str += `
|-${building.get("enable") ? "" : ` style="background-color: #ccc" title="停用"`}
| ${building.get("buildingLv")}
| ${building.get("spaceNum") >= 0 ? building.get("spaceNum") : ""}
| ${building.get("buildingLv") == 1 ? "" : itemlist}
| ${building.get("buildingLv") == 1 ? "" : building.get("homeexp")}`;
		}
		str += `\n|}`;
		out.push(str);
	});

	return out.join("\n\n");
}
