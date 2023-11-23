import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { range } from "../utils";
import { item2wikiWithType } from "../wiki-item";

const HomelandBuildingTable = ImperiumData.fromGamedata().getTable("HomelandBuilding");

export default function wikiHomelandBuilding() {
	let out = wikiH1("冒險營地建築");

	const homelandBuildings = _.groupBy(HomelandBuildingTable.rows, (r) => r.get("buildingId"));
	for (const [, group] of Object.entries(homelandBuildings)) {
		const buildingName =
			localizationString("Homeland")(group[0].get("nameKey")) || group[0].get("nameKey");
		const showSpace = group.some((r) => r.get("spaceNum") >= 0);
		const table: WikiTableStruct = [];
		if (showSpace) {
			table.push([`! 等級`, `! 空間`, `! 升級素材`, `! 升級獲得營地精驗`]);
		} else {
			table.push([`! 等級`, `! 升級素材`, `! 升級獲得營地精驗`]);
		}
		for (let index = 0; index < group.length; index++) {
			const level = group[index];
			const nextLevel = group[index + 1];
			const items = nextLevel
				? range(1, 3)
						.map((i) =>
							item2wikiWithType(
								nextLevel.get(`payType${i}`),
								nextLevel.get(`linkId${i}`),
								nextLevel.get(`amount${i}`),
								{ size: "20px" }
							)
						)
						.filter(Boolean)
				: [];
			table.push({
				attributes: level.get("enable")
					? ""
					: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
				ceils: [
					level.get("buildingLv"),
					...(showSpace ? [level.get("spaceNum")] : []),
					items.join(" "),
					nextLevel?.get("homeexp") ?? "",
				],
			});
		}

		out += `\n\n${wikiH2(buildingName)}\n${wikitable(table)}`;
	}

	return out;
}
