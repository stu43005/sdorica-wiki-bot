import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationQuestModeName, localizationString } from "../localization";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { arraySortBy } from "../utils";
import { wikiNextLine } from "../wiki-utils";

const EvaluateAchievementsTable = ImperiumData.fromGamedata().getTable("EvaluateAchievements");
const AchievementConditionsTable = ImperiumData.fromGamedata().getTable("AchievementConditions");

const typeOrder = ["Normal", "Gold", "Silver"];

export default function wikiEvaluateAchievements() {
	let out = wikiH1("評價成就");

	const groups = _.groupBy(EvaluateAchievementsTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(groups)) {
		out += `\n\n${wikiH2(groupId)}`;

		const modes = _.groupBy(group, (r) => r.get("questModeId"));
		for (const [questModeId, mode] of Object.entries(modes)) {
			const table: WikiTableStruct = {
				attributes: `class="wikitable mw-collapsible"`,
				rows: [
					[
						`! 成就類型`,
						`! 點數`,
						`! 說明`,
						`! 詳細說明`,
					],
				],
			};

			const types = _.groupBy(mode, (r) => r.get("type"));
			const typeList = Object.keys(types).sort(arraySortBy(typeOrder));
			for (const type of typeList) {
				const achievements = types[type];
				for (let index = 0; index < achievements.length; index++) {
					const entry = achievements[index];
					const conditions = getAchievementConditions(entry.get("conditionGroupId"));
					table.rows.push([
						...(index === 0 ? [
							{
								header: true,
								attributes: `rowspan="${achievements.length}"`,
								text: type,
							},
						] : []),
						entry.get("evaluatePoint"),
						localizationString("QuestAchievement")(entry.get("descriptionKey")),
						wikiNextLine(conditions.join("\n")),
					]);
				}
			}

			const questMode = localizationQuestModeName()(questModeId);
			out += `\n\n${wikiH3(questMode, `${groupId}_${questModeId}`)}\n${wikitable(table)}`;
		}
	}

	return out;
}

export function getAchievementConditions(conditionGroupId: string): string[] {
	const descs: string[] = [];
	const conditions = AchievementConditionsTable.filter(row => row.get("conditionGroupId") === conditionGroupId);
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
			// TODO: GoldSkillTagCount,BlackSkillTagCount,WhiteSkillTagCount,SkillTagCount,FriendBuffCount,EnemyBuffCount,BuffCount,GoldTriggerCount,BlackTriggerCount,WhiteTriggerCount,TriggerCount,KillCount,TotalDamage, Race
		}
	}
	return descs;
}
