import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableCeil, WikiTableStruct } from "../templates/wikitable";
import { range } from "../utils";
import { item2wikiWithType } from "../wiki-item";

const BattlefieldDropItemsTable = ImperiumData.fromGamedata().getTable("BattlefieldDropItems");

export default function wikiBattlefieldDropItems() {
	let out = wikiH1("戰場通關獎勵");

	const groups = _.groupBy(BattlefieldDropItemsTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(groups)) {
		const table: WikiTableStruct = [[`! 關卡等級`, `! Boss等級`, `! colspan="4" | 通關獎勵`]];
		const lv1 = group[0];
		for (const entry of group) {
			table.push([
				`Lv. ${entry.get("questLv")}`,
				entry.get("bossLv"),
				...range(1, 4).map(
					(i): WikiTableCeil => ({
						attributes:
							entry.get(`giveLinkId${i}`) != lv1.get(`giveLinkId${i}`)
								? `style="background-color: #ffd700; color: #1e1e1e;"`
								: "",
						text: `${item2wikiWithType(
							entry.get(`giveType${i}`),
							entry.get(`giveLinkId${i}`),
							entry.get(`giveAmount${i}`)
						)}${
							entry.get(`chance${i}`) != 10000 && entry.get(`chance${i}`) != -1
								? `：${entry.get(`chance${i}`) / 100}%`
								: ""
						}`,
					})
				),
			]);
		}
		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
