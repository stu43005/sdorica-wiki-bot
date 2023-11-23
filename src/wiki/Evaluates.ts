import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { gamedataString, localizationQuestModeName } from "../localization";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { wikitable, WikiTableCeil, WikiTableStruct } from "../templates/wikitable";
import { range } from "../utils";
import { item2wikiWithType } from "../wiki-item";
import { wikiNextLine } from "../wiki-utils";

const EvaluatesTable = ImperiumData.fromGamedata().getTable("Evaluates");

const modeImageName: Record<string, string> = {
	QuestMode_01: "幻境普通計分模式.png",
	QuestMode_02: "幻境菁英計分模式.png",
	QuestMode_03: "幻境史詩計分模式.png",
	QuestMode_04: "幻境傳奇計分模式.png",
};

const evaluateRankIconName: Record<string, string> = {
	LoreQuest_Rank_SS_M: "戰場_榮耀試煉_評價_SS_Icon.png",
	LoreQuest_Rank_S_M: "戰場_榮耀試煉_評價_S_Icon.png",
	LoreQuest_Rank_A_M: "戰場_榮耀試煉_評價_A_Icon.png",
	LoreQuest_Rank_B_M: "戰場_榮耀試煉_評價_B_Icon.png",
	LoreQuest_Rank_C_M: "戰場_榮耀試煉_評價_C_Icon.png",
};

export default function wikiEvaluates() {
	let out = wikiH1("戰鬥評價");

	const groups = _.groupBy(EvaluatesTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(groups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 模式`, `! 評價`, `! 點數`, `! colspan="2" | 獲得戰利品`]],
		};

		const modes = _.groupBy(group, (r) => r.get("questModeId"));
		for (const [questModeId, mode] of Object.entries(modes)) {
			const modeImage = gamedataString("QuestMode", "id", "modeImage")(questModeId);
			for (let index = 0; index < mode.length; index++) {
				const entry = mode[index];
				table.rows.push([
					...(index === 0
						? [
								{
									header: true,
									attributes: `rowspan="${mode.length}"`,
									text: wikiNextLine(
										`${wikiimage(modeImageName[modeImage], {
											width: 50,
										})}\n${localizationQuestModeName()(questModeId)}`
									),
								},
						  ]
						: []),
					wikiimage(evaluateRankIconName[entry.get("evaluateRankIcon")], { width: 64 }),
					entry.get("evaluatePoint"),
					...range(1, 2).map(
						(i): WikiTableCeil => ({
							text: item2wikiWithType(
								entry.get(`giveType${i}`),
								entry.get(`giveLinkId${i}`),
								entry.get(`giveAmount${i}`)
							),
						})
					),
				]);
			}
		}

		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
