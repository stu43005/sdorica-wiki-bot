import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import {
	call2,
	distinct,
	localizationChapterName,
	localizationCharacterNameByHeroId,
	rank,
	semicolon,
} from "../localization";
import { Hero } from "../model/hero";
import { HeroSkillSet } from "../model/hero-skillset";
import { wikiH1 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

const FreeHeroesTable = ImperiumData.fromGamedata().getTable("FreeHeroes");

export default function wikiFreeHeroes() {
	const advGroups = _.groupBy(FreeHeroesTable.rows, (row) => row.get("groupId"));
	const table: WikiTableStruct = [["! groupId", "! 章節", "! 角色", "! 階級", "! 技能組"]];
	for (const [groupId, group] of Object.entries(advGroups)) {
		for (let i = 0; i < group.length; i++) {
			const row = group[i];
			const heroId: string = row.get("heroId");
			const hero = Hero.get(heroId)?.toWiki() ?? localizationCharacterNameByHeroId()(heroId);
			const skillSets = HeroSkillSet.getList(row.get("skillSetIds"));
			const chapters = call2(
				semicolon(localizationChapterName()),
				distinct()
			)(row.get("chapterIds"));
			table.push([
				...(i === 0
					? [
							{
								header: true,
								attributes: `rowspan="${group.length}"`,
								text: groupId,
							},
							{
								header: true,
								attributes: `rowspan="${group.length}"`,
								text: chapters,
							},
					  ]
					: []),
				hero,
				rank()(row.get("rank")),
				skillSets
					.map((s) => (typeof s === "string" ? s : `(${s.rankPlus})${s.name}`))
					.join("<br/>"),
			]);
		}
	}
	return `${wikiH1("幻境試煉免費英雄")}\n${wikitable(table)}`;
}
