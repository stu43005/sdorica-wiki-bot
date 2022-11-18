import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { item2wiki, item2wikiWithType } from "../wiki-item";

const AdvAchievementsTable = ImperiumData.fromGamedata().getTable("AdvAchievements");
const AdventureAchievementsTable = ImperiumData.fromGamedata().getTable("AdventureAchievements");

export default function wikiAdvAchievements() {
	let out = wikiH1("幻境成就");

	out += `\n\n${wikiH2("舊版幻境成就")}`;
	const AdvAchievementGroups = _.groupBy(AdvAchievementsTable.rows, r => r.get("tab"));
	for (const [groupId, group] of Object.entries(AdvAchievementGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [
				[
					`! 成就內容`,
					`! 成就獎勵`,
				],
			],
		};
		for (let i = 0; i < group.length; i++) {
			const ach = group[i];
			// const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
			const content = localizationString("Adventure", "achi_")(ach.get("id"));
			const reward = ach.get("rewardItemId");
			const rewardCount = ach.get("rewardCount");
			table.rows.push([
				content,
				item2wiki(reward, rewardCount == 1 ? undefined : rewardCount),
			]);
		}
		out += `\n\n${wikiH3(localizationString("Adventure")(groupId))}\n${wikitable(table)}`;
	}

	out += `\n\n${wikiH2("新版幻境成就")}`;
	const AdventureAchievementGroups = _.groupBy(AdventureAchievementsTable.rows, r => r.get("tab"));
	for (const [groupId, group] of Object.entries(AdventureAchievementGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [
				[
					`! 成就內容`,
					`! 成就獎勵`,
				],
			],
		};
		for (let i = 0; i < group.length; i++) {
			const ach = group[i];
			// const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
			const content = localizationString("Adventure", "achi_")(ach.get("id"));
			const giveType = ach.get("giveType");
			const giveLinkId = ach.get("giveLinkId");
			const giveAmount = ach.get("giveAmount");
			table.rows.push([
				content,
				item2wikiWithType(giveType, giveLinkId, giveAmount == 1 ? undefined : giveAmount),
			]);
		}
		out += `\n\n${wikiH3(localizationString("Adventure")(groupId))}\n${wikitable(table)}`;
	}

	return out;
}
