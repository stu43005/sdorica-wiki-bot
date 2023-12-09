import * as _ from "lodash-es";
import { ImperiumData } from "../imperium-data.js";
import { achReplacer, localizationString } from "../localization.js";
import { QuestMode } from "../model/quest-mode.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";
import { arraySortBy } from "../utils.js";
import { wikiNextLine } from "../wiki-utils.js";
import { wikiimage } from "../templates/wikiimage.js";

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
			const questMode = QuestMode.get(questModeId);
			const table: WikiTableStruct = {
				attributes: `class="wikitable mw-collapsible"`,
				rows: [[`! 成就類型`, `! 點數`, `! 說明`, `! 詳細說明`]],
			};

			const types = _.groupBy(mode, (r) => r.get("type"));
			const typeList = Object.keys(types).sort(arraySortBy(typeOrder));
			for (const type of typeList) {
				const achievements = types[type];
				for (let index = 0; index < achievements.length; index++) {
					const entry = achievements[index];
					const conditions = getAchievementConditions(entry.get("conditionGroupId"));
					table.rows.push([
						...(index === 0
							? [
									{
										header: true,
										attributes: `rowspan="${achievements.length}"`,
										text: type,
									},
							  ]
							: []),
						entry.get("evaluatePoint"),
						achReplacer(
							localizationString("QuestAchievement")(entry.get("descriptionKey")),
						),
						wikiNextLine(conditions.join("\n")),
					]);
				}
			}

			out += `\n\n${wikiH3(
				questMode
					? `${wikiimage({
							url: questMode.getModeImageAssetUrl(),
							height: 25,
					  })} ${questMode.name}`
					: questModeId,
				`${groupId}_${questModeId}`,
			)}\n${wikitable(table)}`;
		}
	}

	return out;
}

export function getAchievementConditions(conditionGroupId: string): string[] {
	const descs: string[] = [];
	const conditions = AchievementConditionsTable.filter(
		(row) => row.get("conditionGroupId") === conditionGroupId,
	);
	for (const condition of conditions) {
		const type: string = condition.get("type");
		const param1: string = condition.get("param1");
		const param2: string = condition.get("param2");
		const param3: string = condition.get("param3");
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
				descs.push(`使用魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "GoldEraseCount":
				descs.push(`使用金色魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "BlackEraseCount":
				descs.push(`使用黑色魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "WhiteEraseCount":
				descs.push(`使用白色魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "TurnCount":
				descs.push(`回合數 ${param2} ${param3}`);
				break;
			case "StoneCount":
				descs.push(`使用${stoneToString(param1)}魂芯 ${param2} ${param3}個`);
				break;
			case "GoldSkillTagCount":
				descs.push(`金位角色施展${skillToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "BlackSkillTagCount":
				descs.push(`黑位角色施展${skillToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "WhiteSkillTagCount":
				descs.push(`白位角色施展${skillToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "SkillTagCount":
				descs.push(`施展${skillToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "GoldTriggerCount":
				descs.push(
					`金位角色不使用魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`,
				);
				break;
			case "BlackTriggerCount":
				descs.push(
					`黑位角色不使用魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`,
				);
				break;
			case "WhiteTriggerCount":
				descs.push(
					`白位角色不使用魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`,
				);
				break;
			case "TriggerCount":
				descs.push(`角色不使用魂芯施展${eraseToString(param1)}技能 ${param2} ${param3}次`);
				break;
			case "Race":
				descs.push(`隊伍攜帶${raceToString(param1)}角色 ${param2} ${param3}名`);
				break;
			case "FriendBuffCount":
				descs.push(
					`我方角色獲得${localizationString("BaseBuff")(
						param1,
					)}總計 ${param2} ${param3}次`,
				);
				break;
			case "EnemyBuffCount":
				descs.push(
					`敵方角色獲得${localizationString("BaseBuff")(
						param1,
					)}總計 ${param2} ${param3}次`,
				);
				break;
			case "KillCount":
				descs.push(`擊殺敵人 ${param2} ${param3}個`);
				break;
			// TODO: BuffCount,TotalDamage
			default:
				descs.push(`${type}(${param1}, ${param2}, ${param3})`);
				break;
		}
	}
	return descs;
}

function raceToString(race: string): string {
	const list = [, "人類", "亞人", "獸人", "羽族", "機械", "野獸", "未知種族"];
	return list[+race] ?? race;
}

function stoneToString(stone: string): string {
	switch (stone) {
		case "Gold":
			return "金色";
		case "Black":
			return "黑色";
		case "White":
			return "白色";
	}
	return stone;
}

function skillToString(skill: string): string {
	switch (skill) {
		case "Attack":
			return "攻擊";
		case "NormalDamage":
			return "基礎攻擊";
		case "BreakArmor":
			return "破甲攻擊";
		case "TrueDamage":
			return "穿透攻擊";
		case "Defend":
			return "治癒或疊盾";
		case "Heal":
			return "治癒";
		case "GainArmor":
			return "疊盾";
		case "StoneAction":
			return "改變魂芯的";
		case "ChangeCD":
			return "操作敵人CD的";
	}
	return skill;
}

function eraseToString(erase: string): string {
	switch (erase) {
		case "All":
			return "任何";
		case "Type1":
			return "一魂";
		case "Type2":
			return "二魂";
		case "Type3":
			return "三魂";
		case "Type3_L":
			return "三魂L型";
		case "Type3_I":
			return "三魂I型";
		case "Type4":
			return "四魂";
		case "Type4_L":
			return "四魂L型";
		case "Type4_I":
			return "四魂I型";
		case "Type6":
			return "六魂";
	}
	return erase;
}
