import * as _ from "lodash-es";
import { ImperiumData } from "../imperium-data.js";
import { Chapter } from "../model/chapter.js";
import { Item } from "../model/item.js";
import { ItemGiveRef } from "../model/item-give-ref.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { wikiPageLink } from "../templates/wikilink.js";
import { wikiul } from "../templates/wikilist.js";
import { wikitable, WikiTableStruct } from "../templates/wikitable.js";

const RewardGroupsTable = ImperiumData.fromGamedata().getTable("RewardGroups");

export default function wikiRewardGroups() {
	let out = wikiH1("累積道具獎勵");

	const rewardGroups = _.groupBy(RewardGroupsTable.rows, (r) => r.get("rewardGroupId"));
	for (const [rewardGroupId, group] of Object.entries(rewardGroups)) {
		const note = group
			.map((r) => r.get("note"))
			.filter(Boolean)
			.join(", ");
		const chapters = Chapter.getByRewardGroupId(rewardGroupId);
		const title =
			(chapters.length == 1 ? `${chapters[0].getWikiFullName()} (${note})` : note) ||
			rewardGroupId;
		out += `\n\n${wikiH2(title, rewardGroupId)}\n${wikiul(
			chapters.map((chapter) => wikiPageLink("Chapter", "", chapter.getWikiFullName())),
		)}`;

		const targetItems = _.groupBy(group, (r) => r.get("targetItemId"));
		for (const [targetItemId, rewardItems] of Object.entries(targetItems)) {
			const targetItem = Item.get(targetItemId);
			const table: WikiTableStruct = {
				attributes: `class="wikitable mw-collapsible mw-collapsed"`,
				rows: [
					[
						{
							header: true,
							attributes: `colspan="2"`,
							text: targetItem?.toWiki() ?? "",
						},
					],
					[`! 累計數量`, `! 獎勵`],
				],
			};

			for (const row of rewardItems) {
				const reward = new ItemGiveRef(
					row.get("giveType"),
					row.get("giveLinkId"),
					row.get("giveAmount"),
				);
				table.rows.push([
					{
						attributes: `style="text-align: center"`,
						text: row.get("targetCount"),
					},
					reward.toWiki(),
				]);
			}

			out += `\n\n${wikiH3(
				targetItem?.name ?? "",
				`${rewardGroupId}_${targetItemId}`,
			)}\n${wikitable(table)}`;
		}
	}

	return out;
}
