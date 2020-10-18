import { ImperiumData } from "../imperium-data";
import { gamedataString, localizationHomelandBuildingName, localizationTavernMissionName } from "../localization";
import { arrayUnique } from "../utils";

const TavernMissionDropTable = ImperiumData.fromGamedata().getTable("TavernMissionDrop");

export default function wikiTavernMissionDrop() {
	const out: string[] = [];
	const TavernMissionDropEnabled = TavernMissionDropTable.filter(r => gamedataString("TavernMission", "id", "enable")(r.get("missionId")) == "true");
	const TavernMissionDropTypes = arrayUnique(TavernMissionDropEnabled.map(r => `${r.get("type")},${r.get("param1")},${r.get("param2")}`));
	for (let i = 0; i < TavernMissionDropTypes.length; i++) {
		const type = TavernMissionDropTypes[i].split(",");
		let str = ``;
		switch (type[0]) {
			case "HomeLevel":
				str += `==冒險營地 Lv.${type[1]}==`;
				break;
			case "Building":
				str += `==${localizationHomelandBuildingName()(type[1])} Lv.${type[2]}==`;
				break;
			case "PlayerLevel":
				str += `==諦視者 Lv.${type[1]}==`;
				break;
			case "Normal":
				str += `==一般==`;
				break;
			case "Novice":
				str += `==新手==`;
				break;
		}
		str += `
{| class="wikitable"
! group !! 選擇數量 !! 任務 !! 出現機率`;
		const TavernMissionDropTyped = TavernMissionDropEnabled.filter(r => r.get("type") == type[0] && r.get("param1") == type[1] && r.get("param2") == type[2]);
		const groupIds = arrayUnique(TavernMissionDropTyped.map(r => r.get("groupId")));
		for (let j = 0; j < groupIds.length; j++) {
			const groupId = groupIds[j];
			const TavernMissionDropTypedGroupd = TavernMissionDropTyped.filter(r => r.get("groupId") == groupId);
			const choiceNumRow = TavernMissionDropTable.find(r => r.get("groupId") == groupId && r.get("choiceNum") != -1);
			const choiceNum = choiceNumRow ? Number(choiceNumRow.get("choiceNum")) : 1;
			const weightCount = TavernMissionDropTypedGroupd.reduce((prev, cur) => prev + Number(cur.get("weight")), 0) / choiceNum;
			for (let k = 0; k < TavernMissionDropTypedGroupd.length; k++) {
				const row = TavernMissionDropTypedGroupd[k];
				if (k == 0) {
					str += `
|-
| rowspan="${TavernMissionDropTypedGroupd.length}" | ${row.get("groupId")}
| rowspan="${TavernMissionDropTypedGroupd.length}" | ${choiceNum}`;
				}
				else {
					str += `\n|-`;
				}
				str += `
| ${localizationTavernMissionName(true)(row.get("missionId"))}
| ${Math.floor(row.get("weight") / weightCount * 10000) / 100}%`;
			}
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
