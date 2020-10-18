import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { item2wiki, item2wikiWithType } from "../wiki-item";

const AdvAchievementsTable = ImperiumData.fromGamedata().getTable("AdvAchievements");
const AdventureAchievementsTable = ImperiumData.fromGamedata().getTable("AdventureAchievements");

export default function wikiAdvAchievements() {
	const out: string[] = [];

	out.push("==舊版幻境成就==");
	const AdvAchievementsTabs = [...new Set(AdvAchievementsTable.rows.map(r => r.get("tab")))];
	for (let i = 0; i < AdvAchievementsTabs.length; i++) {
		const tab = AdvAchievementsTabs[i];
		const achs = AdvAchievementsTable.filter(a => a.get("tab") == tab);
		let str = `===${localizationString("Adventure")(tab).replace(/\n/g, "")}===
{| class="wikitable mw-collapsible"
|-
! 成就內容 !! 成就獎勵`;
		for (let j = 0; j < achs.length; j++) {
			const ach = achs[j];
			const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
			const content = localizationString("Adventure", "achi_")(ach.get("id"));
			const reward = ach.get("rewardItemId");
			const rewardCount = ach.get("rewardCount");
			str += `\n|-\n| ${content} || ${item2wiki(reward, rewardCount == 1 ? undefined : rewardCount)}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	out.push("==新版幻境成就==");
	const AdventureAchievementsTabs = [...new Set(AdventureAchievementsTable.rows.map(r => r.get("tab")))];
	for (let i = 0; i < AdventureAchievementsTabs.length; i++) {
		const tab = AdventureAchievementsTabs[i];
		const achs = AdventureAchievementsTable.filter(a => a.get("tab") == tab);
		let str = `===${localizationString("Adventure")(tab).replace(/\n/g, "")}===
{| class="wikitable mw-collapsible"
|-
! 成就內容 !! 成就獎勵`;
		for (let j = 0; j < achs.length; j++) {
			const ach = achs[j];
			const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
			const content = localizationString("Adventure", "achi_")(ach.get("id"));
			const giveType = ach.get("giveType");
			const giveLinkId = ach.get("giveLinkId");
			const giveAmount = ach.get("giveAmount");
			str += `\n|-\n| ${content} || ${item2wikiWithType(giveType, giveLinkId, giveAmount == 1 ? undefined : giveAmount)}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
