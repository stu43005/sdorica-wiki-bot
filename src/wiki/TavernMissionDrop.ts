import * as _ from "lodash-es";
import numeral from "numeral";
import { ImperiumData } from "../imperium-data.js";
import { localizationHomelandBuildingName } from "../localization.js";
import { TavernMission } from "../model/tavern-mission.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";

const TavernMissionDropTable = ImperiumData.fromGamedata().getTable("TavernMissionDrop");

function getTavernMissionTypeName(type: string, param1: string, param2: number) {
	switch (type) {
		case "HomeLevel":
			return `冒險營地 Lv.${param1}`;
		case "Building":
			return `${localizationHomelandBuildingName()(param1)} Lv.${param2}`;
		case "PlayerLevel":
			return `諦視者 Lv.${param1}`;
		case "Normal":
			return "一般";
		case "Novice":
			return "新手";
	}
	return "";
}

export default function wikiTavernMissionDrop() {
	let out = wikiH1(`篝火出現任務`);

	const TavernMissionDropEnabled = TavernMissionDropTable.filter(
		(r) => TavernMission.get(r.get("missionId"))?.enable ?? false,
	);
	const dropTypes = _.groupBy(
		TavernMissionDropEnabled,
		(r) => `${r.get("type")},${r.get("param1")},${r.get("param2")},${r.get("param3")}`,
	);
	for (const [typeKey, group1] of Object.entries(dropTypes)) {
		const [type, param1, param2] = typeKey.split(",");

		out += `\n\n${wikiH2(getTavernMissionTypeName(type, param1, +param2))}`;
		const table: WikiTableStruct = [[`! groupId`, `! 選擇數量`, `! 任務`, `! 出現機率`]];

		const groups = _.groupBy(group1, (r) => r.get("groupId"));
		for (const [groupId, group2] of Object.entries(groups)) {
			const choiceNumRow = group2.find((r) => r.get("choiceNum") != -1);
			const choiceNum = choiceNumRow ? +choiceNumRow.get("choiceNum") : 1;
			const weightSum = _.sumBy(group2, (r) => +r.get("weight")) / choiceNum;
			for (let k = 0; k < group2.length; k++) {
				const row = group2[k];
				const mission = TavernMission.get(row.get("missionId"));
				table.push([
					...(k === 0
						? [
								{
									attributes: `rowspan="${group2.length}"`,
									text: groupId,
								},
								{
									attributes: `rowspan="${group2.length}"`,
									text: choiceNum,
								},
						  ]
						: []),
					mission?.nameWithRank ?? "",
					numeral(row.get("weight") / weightSum).format("0.[00]%"),
				]);
			}
		}

		out += `\n${wikitable(table)}`;
	}

	return out;
}
