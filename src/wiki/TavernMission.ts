import { ImperiumData } from "../imperium-data";
import { currency2Id, localizationCharacterNameByHeroId, localizationMonsterSkillName, localizationString, rank } from "../localization";
import { arrayUnique } from "../utils";
import { item2wiki, itemlist2wiki } from "../wiki-item";

const TavernMissionRequireTable = ImperiumData.fromGamedata().getTable("TavernMissionRequire");
const TavernMissionTable = ImperiumData.fromGamedata().getTable("TavernMission");

export function tavernTime(time: number) {
	let str = ``;
	if (time >= 60) {
		str += `${Math.floor(time / 60)}小時`;
		time %= 60;
	}
	if (time > 0) {
		str += `${time}分鐘`;
	}
	return str;
}

export function tavernReqSkillIcon(category: string) {
	switch (category) {
		case "ReturnToZero":
			return "{{系統圖標|任務骷顱頭|24px}}";
		case "ReduceTime":
			return "{{系統圖標|任務時鐘|24px}}";
		case "Normal":
			return "";
	}
	return "";
}

export default function wikiTavernMission() {
	const out: string[] = [];
	const TavernMissionTabs = arrayUnique(TavernMissionTable.rows.map(r => r.get("tab")));
	out.push(`[[檔案:2.1_版本前瞻_篝火.png|link=【2019.7.31】世界變動記錄/版本前瞻與回顧]]`);
	for (let i = 0; i < TavernMissionTabs.length; i++) {
		const tab = TavernMissionTabs[i];
		out.push(`==${tab}==`);
		const categorys = [...new Set(TavernMissionTable.filter(r => r.get("tab") == tab).map(r => r.get("category")))].sort((a, b) => a.localeCompare(b));
		for (let j = 0; j < categorys.length; j++) {
			const category = categorys[j];
			let str = `===${category}===
{| class="wikitable mw-collapsible"
|-
! 階級 !! 羈絆等級 !! 任務名稱 !! 需要角色 !! 所需時間 !! 消耗體力 !! 所需技能 !! 出場野獸數量 !! 基礎獎勵 !! 額外獎勵 !! 快速跳過`;
			const missions = TavernMissionTable.filter(r => r.get("tab") == tab && r.get("category") == category);
			for (let k = 0; k < missions.length; k++) {
				const mission = missions[k];
				const reqSkill = TavernMissionRequireTable.filter(r => r.get("missionId") == mission.get("id"));
				const reqHero: string[] = [];
				if (mission.get("heroid")) {
					reqHero.push(`{{角色小圖示|${localizationCharacterNameByHeroId()(mission.get("heroid"))}}}`);
				}
				if (mission.get("heroLv")) {
					reqHero.push(`Lv ${mission.get("heroLv")}`);
				}
				if (mission.get("heroRank") > 2) {
					reqHero.push(`${rank()(mission.get("heroRank"))}`);
				}
				if (!mission.get("gold") || !mission.get("black") || !mission.get("white")) {
					if (mission.get("gold")) reqHero.push(`金位`);
					if (mission.get("black")) reqHero.push(`黑位`);
					if (mission.get("white")) reqHero.push(`白位`);
				}
				let express = "";
				if (mission.get("expressCurrency") && mission.get("expressCurrency") != "-1") {
					express = `${item2wiki(currency2Id()(mission.get("expressCurrency")), mission.get("expressConversion"), false, { text: "" })}`;
				}
				if (mission.get("enable")) {
					str += `\n|-`;
				}
				else {
					str += `\n|- style="background-color: #ccc" title="停用"`;
				}
				str += `
| ${mission.get("questRank")} ★
| ${mission.get("monsterLv")}
| ${localizationString("TavernMission")(mission.get("questKeyName")) || mission.get("questKeyDescription")}
| ${reqHero.join(",<br/>")}
| ${tavernTime(Number(mission.get("time")))}
| x${mission.get("stamina")}
| ${reqSkill.length > 0 ? reqSkill.map(r => `{{狀態圖示|${localizationMonsterSkillName()(r.get("skillId"))}|24px|層數=${r.get("skillLv")}}}${tavernReqSkillIcon(r.get("category"))}${r.get("successRate") / 100}%`).join("<br/>") : ""}
| ${mission.get("spaceNum")}
| ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}
| ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}
| ${express}`;
			}
			str += `\n|}`;
			out.push(str);
		}
	}

	return out.join("\n\n");
}
