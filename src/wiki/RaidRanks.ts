import { ImperiumData } from "../imperium-data";
import { arrayUnique } from "../utils";
import { item2wikiWithType } from "../wiki-item";

const RaidRanksTable = ImperiumData.fromGamedata().getTable("RaidRanks");

export default function wikiRaidRanks() {
	const out: string[] = [];
	const weekRankGroups = arrayUnique(RaidRanksTable.rows.map(r => r.get("groupId")));
	const weekRankImage: Record<string, string> = {
		"rank_week_01": "幻境試煉_週排名_01_Icon.png",
		"rank_week_02": "幻境試煉_週排名_02_Icon.png",
		"rank_week_03": "幻境試煉_週排名_03_Icon.png",
		"rank_week_04": "幻境試煉_週排名_04_Icon.png",
		"rank_week_05": "幻境試煉_週排名_05_Icon.png",
	};

	out.push(`==本週總積分、排名與獎勵==`);
	for (let i = 0; i < weekRankGroups.length; i++) {
		const groupId = weekRankGroups[i];
		let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! colspan="2" | 排名
! colspan="3" | 獎勵`;
		const entries = RaidRanksTable.filter(r => r.get("groupId") == groupId);
		for (let j = 0; j < entries.length; j++) {
			const entry = entries[j];
			str += `\n|-
| style="text-align: center;" | [[File:${weekRankImage[entry.get("rankIcon")]}|64px]]
| style="text-align: center;" | No.${entry.get("maxRanking")}<br>｜<br>${entry.get("minRanking") == -1 ? "∞" : `No.${entry.get("minRanking")}`}
| ${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}
| ${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}
| ${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
