import * as _ from "lodash-es";
import { ImperiumData } from "../imperium-data.js";
import { achReplacer, localizationString } from "../localization.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { wikitable, WikiTableStruct } from "../templates/wikitable.js";
import { item2wikiWithType } from "../wiki-item.js";
import { wikiNextLine } from "../wiki-utils.js";
import { getAchievementConditions } from "./EvaluateAchievements.js";

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
					entry.get("giveAmount"),
				),
				achReplacer(localizationString("QuestAchievement")(entry.get("descriptionKey"))),
				wikiNextLine(conditions.join("\n")),
			]);
		}

		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
