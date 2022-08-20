import { ImperiumData } from "../imperium-data";
import { localizationQuestModeName, localizationString } from "../localization";

const EvaluateAchievementsTable = ImperiumData.fromGamedata().getTable("EvaluateAchievements");
const AchievementConditionsTable = ImperiumData.fromGamedata().getTable("AchievementConditions");

const typeOrder = ["Normal", "Gold", "Silver"];

function typeSort(a: string, b: string) {
	const ai = typeOrder.indexOf(a);
	const bi = typeOrder.indexOf(b);
	if (ai == -1 && bi == -1) {
		return a.localeCompare(b);
	}
	if (ai == -1) {
		return 1;
	}
	if (bi == -1) {
		return -1;
	}
	return ai - bi;
}

export default function wikiEvaluateAchievements() {
	const out: string[] = [];

	const groups = [...new Set(EvaluateAchievementsTable.rows.map(row => row.get("groupId")))];
	for (const groupId of groups) {
		out.push(`== ${groupId} ==`);

		const groupedAchievements = EvaluateAchievementsTable.filter(row => row.get("groupId") === groupId);
		const modes = [...new Set(groupedAchievements.map(row => row.get("questModeId")))];
		for (const mode of modes) {
			const modeAchievements = groupedAchievements.filter(row => row.get("questModeId") === mode);
			const types = [...new Set(modeAchievements.map(row => row.get("type")))].sort(typeSort);
			let str = `=== ${localizationQuestModeName()(mode)} ===
{| class="wikitable mw-collapsible"
|-
! 成就類型 !! 點數 !! 說明 !! 詳細說明`;
			for (const type of types) {
				const typeAchievements = modeAchievements.filter(row => row.get("type") === type);
				str += `\n|-
! rowspan="${typeAchievements.length}" | ${type}`;
				for (let index = 0; index < typeAchievements.length; index++) {
					const entry = typeAchievements[index];
					if (index > 0) {
						str += "\n|-";
					}
					const descs: string[] = [];
					const conditions = AchievementConditionsTable.filter(row => row.get("conditionGroupId") === entry.get("conditionGroupId"));
					for (const condition of conditions) {
						const type = condition.get("type");
						const param1 = condition.get("param1");
						const param2 = condition.get("param2");
						const param3 = condition.get("param3");
						switch (type) {
							case "BattleScore":
								descs.push(`戰鬥積分 ${param2} ${param3}`);
								break;
							case "MaxDamage":
								descs.push(`單次技能造成傷害 ${param2} ${param3}`);
								break;
							case "HPRatio":
								descs.push(`通關時我方角色總血量 ${param2} ${param3}%`);
								break;
							case "ArmorRatio":
								descs.push(`通關時我方角色總護盾 ${param2} ${param3}%`);
								break;
							case "DeathCount":
								descs.push(`我方角色死亡 ${param2} ${param3}次`);
								break;
							case "EraseCount":
								descs.push(`使用魂芯施展 ${param1}技能 ${param2} ${param3}次`);
								break;
							case "GoldEraseCount":
								descs.push(`使用金色魂芯施展 ${param1}技能 ${param2} ${param3}次`);
								break;
							case "BlackEraseCount":
								descs.push(`使用黑色魂芯施展 ${param1}技能 ${param2} ${param3}次`);
								break;
							case "WhiteEraseCount":
								descs.push(`使用白色魂芯施展 ${param1}技能 ${param2} ${param3}次`);
								break;
							case "TurnCount":
								descs.push(`回合數 ${param2} ${param3}`);
								break;
							case "StoneCount":
								descs.push(`使用${param1}魂芯 ${param2} ${param3}個`);
								break;
						}
					}
					str += `
| ${entry.get("evaluatePoint")}
| ${localizationString("QuestAchievement")(entry.get("descriptionKey"))}
| ${descs.join("<br/>\n")}`;
				}
			}
			str += `\n|}`;
			out.push(str);
		}
	}

	return out.join("\n\n");
}
