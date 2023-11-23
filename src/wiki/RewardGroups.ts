import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { Chapter } from "../model/chapter";
import { Item } from "../model/item";
import { ItemGiveRef } from "../model/item-give-ref";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { wikiPageLink } from "../templates/wikilink";
import { wikiul } from "../templates/wikilist";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

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
			chapters.map((chapter) => wikiPageLink("Chapter", "", chapter.getWikiFullName()))
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
					row.get("giveAmount")
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
				`${rewardGroupId}_${targetItemId}`
			)}\n${wikitable(table)}`;
		}
	}

	return out;
}
