import _ from "lodash";
import { localizationString } from "../localization";
import { TavernMission } from "../model/tavern-mission";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { WikiTableStruct, wikitable } from "../templates/wikitable";
import { sortCategory } from "../utils";
import { wikiNextLine } from "../wiki-utils";

export default function wikiTavernMission() {
	let out = wikiH1(localizationString("Homeland")("tavern_title"));

	const tabs = _.groupBy(TavernMission.getAll(), (r) => r.tab);
	const sortedTabs = Object.entries(tabs).sort((a, b) => sortCategory(a[0], b[0]));
	for (const [tab, group] of sortedTabs) {
		out += `\n\n${wikiH2(tab)}`;

		const categorys = _.groupBy(group, (r) => r.category);
		const sortedCategorys = Object.entries(categorys).sort((a, b) => sortCategory(a[0], b[0]));
		for (const [category, missions] of sortedCategorys) {
			const table: WikiTableStruct = {
				attributes: `class="wikitable mw-collapsible"`,
				rows: [
					[
						`! 階級`,
						`! 羈絆等級`,
						`! 任務名稱`,
						`! 需要角色`,
						`! 所需時間`,
						`! 消耗體力`,
						`! 所需技能`,
						`! 出場野獸數量`,
						`! 基礎獎勵`,
						`! 額外獎勵`,
						`! 快速跳過`,
					],
				],
			};

			for (const mission of missions) {
				const reqHero: string[] = [];
				if (mission.hero) {
					reqHero.push(mission.hero.toWiki());
				}
				if (mission.heroLv > 1) {
					reqHero.push(`Lv ${mission.heroLv}`);
				}
				if (mission.heroRankN > 2) {
					reqHero.push(`${mission.heroRank}`);
				}
				if (mission.heroSlot) {
					reqHero.push(mission.heroSlot);
				}

				table.rows.push({
					attributes: mission.enable
						? ""
						: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
					ceils: [
						`${mission.questRank} ★`,
						mission.monsterLv,
						mission.name,
						wikiNextLine(reqHero.join(",\n")),
						mission.getTimeString(),
						`x${mission.stamina}`,
						mission.reqSkills.length > 0
							? wikiNextLine(
									mission.reqSkills
										.map((r) => `${r.toWiki()}${r.getSuccessRateString()}`)
										.join("\n")
							  )
							: "",
						mission.spaceNum,
						mission.displayDropItem.toWiki({ text: "", listType: "br" }),
						mission.displayExtraDropItem.toWiki({ text: "", listType: "br" }),
						mission.express?.toWiki({ text: "" }) ?? "",
					],
				});
			}

			out += `\n\n${wikiH3(category)}\n${wikitable(table)}`;
		}
	}

	return out;
}
