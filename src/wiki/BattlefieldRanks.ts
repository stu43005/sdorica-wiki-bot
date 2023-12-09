import * as _ from "lodash-es";
import { ImperiumData } from "../imperium-data.js";
import { LookupTableCategory } from "../model/enums/custom/lookup-table-category.enum.js";
import { ItemGiveRef } from "../model/item-give-ref.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { wikiimage } from "../templates/wikiimage.js";
import { WikiTableCeil, WikiTableStruct, wikitable } from "../templates/wikitable.js";
import { range } from "../utils.js";
import { wikiNextLine } from "../wiki-utils.js";

const BattlefieldRanksTable = ImperiumData.fromGamedata().getTable("BattlefieldRanks");

export default function wikiBattlefieldRanks() {
	let out = wikiH1("戰場排名獎勵");

	const weekRankGroups = _.groupBy(BattlefieldRanksTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(weekRankGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! colspan="2" | 排名`, `! colspan="4" | 獎勵`]],
		};
		for (const entry of group) {
			const rankIcon = entry.get("rankIcon");
			table.rows.push([
				{
					attributes: `style="text-align: center;"`,
					text: rankIcon
						? wikiimage({
								category: LookupTableCategory.TierMedalSprite,
								key: rankIcon,
								width: 64,
						  })
						: "",
				},
				{
					attributes: `style="text-align: center;"`,
					text: wikiNextLine(
						`No.${entry.get("maxRanking")}\n｜\n${
							entry.get("minRanking") == -1 ? "∞" : `No.${entry.get("minRanking")}`
						}`,
					),
				},
				...range(1, 3).map(
					(i): WikiTableCeil => ({
						text: new ItemGiveRef(
							entry.get(`giveType${i}`),
							entry.get(`giveLinkId${i}`),
							entry.get(`giveAmount${i}`),
						).toWiki(),
					}),
				),
			]);
		}
		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
