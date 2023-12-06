import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { LookupTableCategory } from "../model/enums/lookup-table-category.enum";
import { ItemGiveRef } from "../model/item-give-ref";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { WikiTableCeil, WikiTableStruct, wikitable } from "../templates/wikitable";
import { range } from "../utils";
import { wikiNextLine } from "../wiki-utils";

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
						}`
					),
				},
				...range(1, 4).map(
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
		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
