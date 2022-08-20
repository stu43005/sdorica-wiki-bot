import { ImperiumData } from "../imperium-data";
import { gamedataString, localizationQuestModeName } from "../localization";
import { item2wikiWithType } from "../wiki-item";

const EvaluatesTable = ImperiumData.fromGamedata().getTable("Evaluates");

const modeImageName: Record<string, string> = {
	"QuestMode_01": "幻境普通計分模式.png",
	"QuestMode_02": "幻境菁英計分模式.png",
	"QuestMode_03": "幻境史詩計分模式.png",
	"QuestMode_04": "幻境傳奇計分模式.png",
};

const evaluateRankIconName: Record<string, string> = {
	"LoreQuest_Rank_SS_M": "戰場_榮耀試煉_評價_SS_Icon.png",
	"LoreQuest_Rank_S_M": "戰場_榮耀試煉_評價_S_Icon.png",
	"LoreQuest_Rank_A_M": "戰場_榮耀試煉_評價_A_Icon.png",
	"LoreQuest_Rank_B_M": "戰場_榮耀試煉_評價_B_Icon.png",
	"LoreQuest_Rank_C_M": "戰場_榮耀試煉_評價_C_Icon.png",
};

export default function wikiEvaluates() {
	const out: string[] = [];

	const groups = [...new Set(EvaluatesTable.rows.map(row => row.get("groupId")))];
	for (const groupId of groups) {
		const groupedEvaluates = EvaluatesTable.filter(row => row.get("groupId") === groupId);
		const modes = [...new Set(groupedEvaluates.map(row => row.get("questModeId")))];
		let str = `== ${groupId} ==
{| class="wikitable mw-collapsible"
|-
! 模式 !! 評價 !! 點數
! colspan="2" | 獲得戰利品`;
		for (const mode of modes) {
			const modeRanks = groupedEvaluates.filter(row => row.get("questModeId") === mode);
			str += `\n|-
! rowspan="${modeRanks.length}" | [[File:${modeImageName[gamedataString("QuestMode", "id", "modeImage")(mode)]}|50px]]<br/>${localizationQuestModeName()(mode)}`;
			for (let index = 0; index < modeRanks.length; index++) {
				const rank = modeRanks[index];
				if (index > 0) {
					str += "\n|-";
				}
				str += `
| [[File:${evaluateRankIconName[rank.get("evaluateRankIcon")]}|64px]]
| ${rank.get("evaluatePoint")}
| ${item2wikiWithType(rank.get("giveType1"), rank.get("giveLinkId1"), rank.get("giveAmount1"))}
| ${item2wikiWithType(rank.get("giveType2"), rank.get("giveLinkId2"), rank.get("giveAmount2"))}`;
			}
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
