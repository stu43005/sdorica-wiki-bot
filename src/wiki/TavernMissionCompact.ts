import { ImperiumData } from "../imperium-data";
import { gamedataString, localizationHomelandBuildingName, localizationMonsterSkillName, localizationTavernMissionName } from "../localization";
import { arrayUnique } from "../utils";
import { itemlist2wiki } from "../wiki-item";
import { tavernReqSkillIcon } from "./TavernMission";

const TavernMissionDropTable = ImperiumData.fromGamedata().getTable("TavernMissionDrop");
const TavernMissionRequireTable = ImperiumData.fromGamedata().getTable("TavernMissionRequire");
const TavernMissionTable = ImperiumData.fromGamedata().getTable("TavernMission");

function tavernCategoryName(missionName: string) {
	if (missionName.indexOf("田野調查") != -1) {
		return "田野調查";
	}
	if (missionName.indexOf("營地巡邏") != -1) {
		return "營地巡邏";
	}
	if (missionName.indexOf("材料收集") != -1) {
		return "材料收集";
	}
	if (missionName.indexOf("戰鬥訓練") != -1) {
		return "戰鬥訓練";
	}
	if (missionName.indexOf("糧食儲備") != -1) {
		return "糧食儲備";
	}
	if (missionName.indexOf("祕境尋寶") != -1) {
		return "祕境尋寶";
	}
	if (missionName.indexOf("秘境") != -1) {
		return "秘境";
	}
	if (missionName.indexOf("區域探勘") != -1) {
		return "區域探勘";
	}
	if (missionName.indexOf("擴建計畫") != -1) {
		return "發展";
	}
	if (missionName.indexOf("精進計畫") != -1) {
		return "發展";
	}
	return missionName.replace(/【[^】]*】/, "");
}

export default function wikiTavernMissionCompact() {
	const out: string[] = [];

	const TavernMissionDaily = TavernMissionTable.filter(r => r.get("tab") == "daily" && r.get("category") == "daily");
	const TavernMissionDailyIds = TavernMissionDaily.map(r => r.get("id"));
	const TavernMissionDropEnabled = TavernMissionDropTable.filter(r => gamedataString("TavernMission", "id", "enable")(r.get("missionId")) == "true");
	const TavernMissionDropDaily = TavernMissionDropEnabled.filter(r => TavernMissionDailyIds.indexOf(r.get("missionId")) != -1 && r.get("type") == "Building" && r.get("param1") == 2 && gamedataString("TavernMission", "id", "questRank")(r.get("missionId")) == r.get("param2"));
	const TavernMissionDropDailyTypes = arrayUnique(TavernMissionDropDaily.map(r => `${r.get("type")},${r.get("param1")},${r.get("param2")}`));

	out.push(`==[[File:冒險任務_每日任務_Icon.png|45px]] 每日任務==`);
	for (let i = 0; i < TavernMissionDropDailyTypes.length; i++) {
		const type = TavernMissionDropDailyTypes[i].split(",");
		let isPrintHeader = false;
		let str = "";
		const TavernMissionDropTyped = TavernMissionDropDaily.filter(r => r.get("type") == type[0] && r.get("param1") == type[1] && r.get("param2") == type[2]);
		const maxReqSkillCount = Math.max(1, ...TavernMissionDropTyped.map(r1 => {
			const reqSkill = TavernMissionRequireTable.filter(r2 => r2.get("missionId") == r1.get("missionId"));
			return reqSkill.length;
		}));
		const groupIds = arrayUnique(TavernMissionDropTyped.map(r => r.get("groupId")));
		for (let j = 0; j < groupIds.length; j++) {
			const groupId = groupIds[j];
			const TavernMissionDropTypedGroupd = TavernMissionDropTyped.filter(r => r.get("groupId") == groupId);
			for (let k = 0; k < TavernMissionDropTypedGroupd.length; k++) {
				const row = TavernMissionDropTypedGroupd[k];
				const missionId = row.get("missionId");
				const mission = TavernMissionTable.find(r => r.get("id") == missionId);
				if (mission) {
					const missionName = localizationTavernMissionName()(missionId);
					const reqSkill = TavernMissionRequireTable.filter(r => r.get("missionId") == mission.get("id"));
					let reqHeroPosition = "";
					if (!mission.get("gold") || !mission.get("black") || !mission.get("white")) {
						if (mission.get("gold")) reqHeroPosition = `金`;
						else if (mission.get("black")) reqHeroPosition = `黑`;
						else if (mission.get("white")) reqHeroPosition = `白`;
					}
					const sameDropItem = !TavernMissionDropTypedGroupd.find(r1 => {
						const m1 = TavernMissionTable.find(r2 => r2.get("id") == r1.get("missionId"));
						if (m1) {
							return m1.get("displayDropItem") != mission.get("displayDropItem");
						}
						return true;
					});
					const sameExtraDropItem = !TavernMissionDropTypedGroupd.find(r1 => {
						const m1 = TavernMissionTable.find(r2 => r2.get("id") == r1.get("missionId"));
						if (m1) {
							return m1.get("displayExtraDropItem") != mission.get("displayExtraDropItem");
						}
						return true;
					});

					if (!isPrintHeader) {
						isPrintHeader = true;
						str += `===${localizationHomelandBuildingName()(type[1])} ${type[2]} 級【${type[2]} ★】===
{| class="wikitable table-responsive-autowrap"
! 類型 !! 任務
! colspan="${maxReqSkillCount}" | 所需技能
! 基礎獎勵 !! 額外獎勵`;
					}

					str += `\n|-`;

					if (k == 0) {
						str += `\n| rowspan="${TavernMissionDropTypedGroupd.length}" style="text-align: center;" | [[檔案:冒險任務_${tavernCategoryName(missionName)}_Icon.png|40px]]<br/>${tavernCategoryName(missionName)}`;
					}

					str += `
| ${reqHeroPosition ? `{{站位圖標|${reqHeroPosition}|size=24px}} ` : ""}${localizationTavernMissionName()(row.get("missionId"))}
| ${reqSkill.length > 0 ? reqSkill.map(r => `{{狀態圖示|${localizationMonsterSkillName()(r.get("skillId"))}|24px|層數=${r.get("skillLv")}}}${tavernReqSkillIcon(r.get("category"))}`).join(" || ") : ""}${Array(maxReqSkillCount - reqSkill.length + 1).join(" || ")}`;

					if (sameDropItem) {
						if (k == 0) {
							str += `\n| rowspan="${TavernMissionDropTypedGroupd.length}" | ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}`;
						}
					}
					else {
						str += `\n| ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}`;
					}

					if (sameExtraDropItem) {
						if (k == 0) {
							str += `\n| rowspan="${TavernMissionDropTypedGroupd.length}" | ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}`;
						}
					}
					else {
						str += `\n| ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}`;
					}
				}
			}
		}
		str += `\n|}`;
		out.push(str);
	}

	const TavernMissionAchievement = TavernMissionTable.filter(r => r.get("tab") == "achievement" && r.get("category") == "achievement");
	const TavernMissionAchievementIds = TavernMissionAchievement.map(r => r.get("id"));
	const TavernMissionDropAchievement = TavernMissionDropEnabled.filter(r => TavernMissionAchievementIds.indexOf(r.get("missionId")) != -1);
	const TavernMissionDropAchievementTypes = arrayUnique(TavernMissionDropAchievement.map(r => r.get("type") == "Building" ? `${r.get("type")},${r.get("param1")}` : r.get("type")));

	out.push(`==[[File:冒險任務_成長任務_Icon.png|45px]] 成長任務==`);
	for (let i = 0; i < TavernMissionDropAchievementTypes.length; i++) {
		const type = TavernMissionDropAchievementTypes[i].split(",");
		const TavernMissionDropTyped = TavernMissionDropAchievement.filter(r => r.get("type") == type[0] && (type.length < 2 || r.get("param1") == type[1]));
		const maxReqSkillCount = Math.max(1, ...TavernMissionDropTyped.map(r1 => {
			const reqSkill = TavernMissionRequireTable.filter(r2 => r2.get("missionId") == r1.get("missionId"));
			return reqSkill.length;
		}));
		let typeName = "";
		switch (type[0]) {
			case "HomeLevel":
				typeName = "冒險營地";
				break;
			case "Building":
				typeName = localizationHomelandBuildingName()(type[1]);
				break;
			case "PlayerLevel":
				typeName = `諦視者`;
				break;
		}
		let str = `===${typeName}===
{| class="wikitable table-responsive-autowrap"
! 類型 !! ${typeName} !! 星級 !! 任務
! colspan="${maxReqSkillCount}" | 所需技能
! 基礎獎勵 !! 額外獎勵`;
		for (let k = 0; k < TavernMissionDropTyped.length; k++) {
			const row = TavernMissionDropTyped[k];
			const missionId = row.get("missionId");
			const mission = TavernMissionTable.find(r => r.get("id") == missionId);
			if (mission) {
				const missionName = localizationTavernMissionName()(missionId);
				const reqSkill = TavernMissionRequireTable.filter(r => r.get("missionId") == mission.get("id"));
				let reqHeroPosition = "";
				if (!mission.get("gold") || !mission.get("black") || !mission.get("white")) {
					if (mission.get("gold")) reqHeroPosition = `金`;
					else if (mission.get("black")) reqHeroPosition = `黑`;
					else if (mission.get("white")) reqHeroPosition = `白`;
				}

				if (k == 0) {
					str += `
|-
| rowspan="${TavernMissionDropTyped.length}" style="text-align: center;" | [[檔案:冒險任務_${tavernCategoryName(missionName)}_Icon.png|40px]]<br/>${tavernCategoryName(missionName)}`;
				}
				else {
					str += `\n|-`;
				}
				str += `
| Lv ${row.get("param2") == -1 ? row.get("param1") : row.get("param2")} || ${mission.get("questRank")} ★
| ${reqHeroPosition ? `{{站位圖標|${reqHeroPosition}|size=24px}} ` : ""}${localizationTavernMissionName()(row.get("missionId"))}
| ${reqSkill.length > 0 ? reqSkill.map(r => `{{狀態圖示|${localizationMonsterSkillName()(r.get("skillId"))}|24px|層數=${r.get("skillLv")}}}${tavernReqSkillIcon(r.get("category"))}`).join(" || ") : ""}${Array(maxReqSkillCount - reqSkill.length + 1).join(" || ")}
| ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}
| ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}`;
			}
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
