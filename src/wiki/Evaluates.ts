import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { LookupTableCategory } from "../model/enums/lookup-table-category.enum";
import { ItemGiveRef } from "../model/item-give-ref";
import { QuestMode } from "../model/quest-mode";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { WikiTableCeil, WikiTableStruct, wikitable } from "../templates/wikitable";
import { range } from "../utils";
import { wikiNextLine } from "../wiki-utils";

const EvaluatesTable = ImperiumData.fromGamedata().getTable("Evaluates");

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
			const questMode = QuestMode.get(questModeId);
			for (let index = 0; index < mode.length; index++) {
				const entry = mode[index];
				table.rows.push([
					...(index === 0
						? [
								{
									header: true,
									attributes: `rowspan="${mode.length}"`,
									text: questMode
										? wikiNextLine(
												`${wikiimage({
													url: questMode.getModeImageAssetUrl(),
													width: 50,
												})}\n${questMode.name}`
										  )
										: questModeId,
								},
						  ]
						: []),
					wikiimage({
						category: LookupTableCategory.TierMedalSprite,
						key: entry.get("evaluateRankIcon"),
						width: 64,
					}),
					entry.get("evaluatePoint"),
					...range(1, 2).map(
						(i): WikiTableCeil => ({
							text: new ItemGiveRef(
								entry.get(`giveType${i}`),
								entry.get(`giveLinkId${i}`),
								entry.get(`giveAmount${i}`)
							).toWiki(),
						})
					),
				]);
			}
		}

		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
