import * as _ from "lodash-es";
import { ImperiumData } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import { ItemGiveRef } from "../model/item-give-ref.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";

const AdvAchievementsTable = ImperiumData.fromGamedata().getTable("AdvAchievements");
const AdventureAchievementsTable = ImperiumData.fromGamedata().getTable("AdventureAchievements");

export default function wikiAdvAchievements() {
	let out = wikiH1("幻境成就");

	out += `\n\n${wikiH2("舊版幻境成就")}`;
	const AdvAchievementGroups = _.groupBy(AdvAchievementsTable.rows, (r) => r.get("tab"));
	for (const [groupId, group] of Object.entries(AdvAchievementGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 成就內容`, `! 成就獎勵`]],
		};
		for (let i = 0; i < group.length; i++) {
			const ach = group[i];
			// const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
			const content = localizationString("Adventure", "achi_")(ach.get("id"));
			const rewardRef = ItemGiveRef.createItem(
				ach.get("rewardItemId"),
				ach.get("rewardCount"),
			);
			table.rows.push([content, rewardRef.toWiki()]);
		}
		out += `\n\n${wikiH3(localizationString("Adventure")(groupId))}\n${wikitable(table)}`;
	}

	out += `\n\n${wikiH2("新版幻境成就")}`;
	const AdventureAchievementGroups = _.groupBy(AdventureAchievementsTable.rows, (r) =>
		r.get("tab"),
	);
	for (const [groupId, group] of Object.entries(AdventureAchievementGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 成就內容`, `! 成就獎勵`]],
		};
		for (let i = 0; i < group.length; i++) {
			const ach = group[i];
			// const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
			const content = localizationString("Adventure", "achi_")(ach.get("id"));
			const giveRef = new ItemGiveRef(
				ach.get("giveType"),
				ach.get("giveLinkId"),
				ach.get("giveAmount"),
			);
			table.rows.push([content, giveRef.toWiki()]);
		}
		out += `\n\n${wikiH3(localizationString("Adventure")(groupId))}\n${wikitable(table)}`;
	}

	return out;
}
