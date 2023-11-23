import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { wikitable, WikiTableCeil, WikiTableStruct } from "../templates/wikitable";
import { range } from "../utils";
import { item2wikiWithType } from "../wiki-item";
import { wikiNextLine } from "../wiki-utils";
import { weekRankImage } from "./AdventureRank";

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
			table.rows.push([
				{
					attributes: `style="text-align: center;"`,
					text: wikiimage(weekRankImage[entry.get("rankIcon")], { width: 64 }),
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
						text: item2wikiWithType(
							entry.get(`giveType${i}`),
							entry.get(`giveLinkId${i}`),
							entry.get(`giveAmount${i}`)
						),
					})
				),
			]);
		}
		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
