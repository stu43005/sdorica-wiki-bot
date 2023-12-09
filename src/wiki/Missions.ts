import * as _ from "lodash-es";
import { Mission } from "../model/mission.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { wikitable, WikiTableStruct } from "../templates/wikitable.js";
import { sortCategory } from "../utils.js";

export default function wikiMissions() {
	let out = wikiH1("任務");

	const tabs = _.groupBy(Mission.getAll(), (r) => r.tab);
	const sortedTabs = Object.entries(tabs).sort((a, b) => sortCategory(a[0], b[0]));
	for (const [tab, group] of sortedTabs) {
		out += `\n\n${wikiH2(tab)}`;

		const categorys = _.groupBy(group, (r) => r.category);
		const sortedCategorys = Object.entries(categorys).sort((a, b) => sortCategory(a[0], b[0]));
		for (const [category, missions] of sortedCategorys) {
			const table: WikiTableStruct = {
				attributes: `class="wikitable mw-collapsible"`,
				rows: [[`! 諦視者等級`, `! 任務內容`, `! 任務獎勵`]],
			};
			const sortedMissions = missions.sort((a, b) => a.order - b.order);
			for (const mission of sortedMissions) {
				table.rows.push({
					attributes:
						mission.enable && mission.weight != 0
							? ""
							: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
					ceils: [
						mission.minLv == -1
							? {
									attributes: `style="text-align: center;"`,
									text: `-`,
							  }
							: mission.maxLv == 99
							  ? `${mission.minLv} ↑`
							  : `${mission.minLv} ~ ${mission.maxLv}`,
						mission.getMissionName(true),
						mission.giveItem.toWiki(),
					],
				});
			}
			out += `\n\n${wikiH3(category)}\n${wikitable(table)}`;
		}
	}

	return out;
}
