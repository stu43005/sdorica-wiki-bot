import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { achReplacer, localizationString } from "../localization";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { item2wikiWithType } from "../wiki-item";
import { wikiNextLine } from "../wiki-utils";
import { getAchievementConditions } from "./EvaluateAchievements";

const QuestAchievementsTable = ImperiumData.fromGamedata().getTable("QuestAchievements");

export default function wikiQuestAchievements() {
	let out = wikiH1("戰鬥成就獎勵");

	const groups = _.groupBy(QuestAchievementsTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(groups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 獎勵`, `! 說明`, `! 詳細說明`]],
		};
		for (const entry of group) {
			const conditions = getAchievementConditions(entry.get("conditionGroupId"));
			table.rows.push([
				item2wikiWithType(
					entry.get("giveType"),
					entry.get("giveLinkId"),
					entry.get("giveAmount")
				),
				achReplacer(localizationString("QuestAchievement")(entry.get("descriptionKey"))),
				wikiNextLine(conditions.join("\n")),
			]);
		}

		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
