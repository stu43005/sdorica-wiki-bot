import { ImperiumData } from "../imperium-data";
import { Chapter } from "../model/chapter";
import { arrayUnique } from "../utils";
import { item2wiki, item2wikiWithType } from "../wiki-item";

const RewardGroupsTable = ImperiumData.fromGamedata().getTable("RewardGroups");

export default function wikiRewardGroups() {
	const rewardGroupIds = arrayUnique(RewardGroupsTable.rows.map(r => r.get("rewardGroupId")));
	const out: string[] = [];
	for (let i = 0; i < rewardGroupIds.length; i++) {
		const rewardGroupId = rewardGroupIds[i];
		const items = RewardGroupsTable.filter(r => r.get("rewardGroupId") == rewardGroupId);
		const targetItems = arrayUnique(items.map(r => r.get("targetItemId")));

		const chapters = Chapter.getAll().filter(ch => ch.rewardGroupId == rewardGroupId);
		const note = items.map(r => r.get("note")).filter(note => !!note).join(", ");
		const title = (chapters.length == 1 ? `${chapters[0].getWikiTitle()} (${note})` : note) || rewardGroupId;
		let str = `== ${title} ==
${chapters.map(chapter => `\n* [[${chapter.getWikiTitle()}]]`).join('')}`;

		for (let j = 0; j < targetItems.length; j++) {
			const targetItem = targetItems[j];
			const rewardItems = items.filter(r => r.get("targetItemId") == targetItem);
			str += `\n{| class="wikitable mw-collapsible mw-collapsed"
! colspan=2 | ${item2wiki(targetItem)}
|-
! 累計數量 !! 獎勵`;
			for (let k = 0; k < rewardItems.length; k++) {
				const reward = rewardItems[k];
				const targetCount = reward.get("targetCount");
				const rewardType = reward.get("giveType");
				const rewardItemId = reward.get("giveLinkId");
				const rewardCount = reward.get("giveAmount");
				str += `\n|-
| style="text-align: center" | ${targetCount}
| ${item2wikiWithType(rewardType, rewardItemId, rewardCount)}`;
			}
			str += `\n|}`;
		}
		out.push(str);
	}
	return out.join("\n\n");
}
