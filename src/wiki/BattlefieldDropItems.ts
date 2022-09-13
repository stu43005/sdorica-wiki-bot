import { ImperiumData } from "../imperium-data";
import { arrayUnique } from "../utils";
import { item2wikiWithType } from "../wiki-item";

const BattlefieldDropItemsTable = ImperiumData.fromGamedata().getTable("BattlefieldDropItems");

export default function wikiBattlefieldDropItems() {
	const out: string[] = [];
	const groups = arrayUnique(BattlefieldDropItemsTable.rows.map(r => r.get("groupId")));

	for (const groupId of groups) {
		let str = `== group ${groupId} ==
{| class="wikitable mw-collapsible"
|-
! 關卡等級 !! Boss等級
! colspan="4" | 通關獎勵`;
		const entries = BattlefieldDropItemsTable.filter(r => r.get("groupId") == groupId);
		const lv1 = entries[0];
		for (const entry of entries) {
			str += `\n|-
| Lv. ${entry.get("questLv")}
| ${entry.get("bossLv")}
| ${entry.get("giveLinkId1") != lv1.get("giveLinkId1") ? `style="background-color: #ffd700;" | ` : ""}${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}${entry.get("chance1") != 10000 && entry.get("chance1") != -1 ? `：${entry.get("chance1") / 100}%` : ""}
| ${entry.get("giveLinkId2") != lv1.get("giveLinkId2") ? `style="background-color: #ffd700;" | ` : ""}${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}${entry.get("chance2") != 10000 && entry.get("chance2") != -1 ? `：${entry.get("chance2") / 100}%` : ""}
| ${entry.get("giveLinkId3") != lv1.get("giveLinkId3") ? `style="background-color: #ffd700;" | ` : ""}${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}${entry.get("chance3") != 10000 && entry.get("chance3") != -1 ? `：${entry.get("chance3") / 100}%` : ""}
| ${entry.get("giveLinkId4") != lv1.get("giveLinkId4") ? `style="background-color: #ffd700;" | ` : ""}${item2wikiWithType(entry.get("giveType4"), entry.get("giveLinkId4"), entry.get("giveAmount4"))}${entry.get("chance4") != 10000 && entry.get("chance4") != -1 ? `：${entry.get("chance4") / 100}%` : ""}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
