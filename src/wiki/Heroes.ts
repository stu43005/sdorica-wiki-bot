import _ from "lodash";
import { Hero } from "../model/hero";
import { heroSlotIconTemplate } from "../templates/hero-slot-icon";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiPageLink } from "../templates/wikilink";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { sortByCharacterModelNo } from "../utils";

function getSortedHeroes() {
	return Hero.getAll().sort((a, b) => {
		if (a.enable && !b.enable) return -1;
		if (!a.enable && b.enable) return 1;
		if (a.empty && !b.empty) return 1;
		if (!a.empty && b.empty) return -1;
		return sortByCharacterModelNo(a.model, b.model);
	});
}

export default function wikiHeroes() {
	let out = wikiH1("英雄角色");

	const sortedHeroes = getSortedHeroes();
	const grouppedHeroes = _.groupBy(sortedHeroes, (hero) =>
		hero.enable ? hero.series : hero.empty ? "環境" : "停用"
	);

	for (const [groupId, group] of Object.entries(grouppedHeroes)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable table-responsive-autowrap" style="word-break: break-word;"`,
			rows: [
				[
					`! width="6%" | id`,
					`! width="10%" | 模組`,
					`! width="6%" | 站位`,
					`! 名稱`,
					`! 技能書`,
					`! width="6%" | 攻擊`,
					`! width="6%" | 體力`,
					`! width="6%" | 復活`,
					`! 角色故事`,
					`! 共鳴材料`,
				],
			],
		};
		for (const hero of group) {
			const skillbooks = hero.books.map(
				(book) => book.bookItem?.toWiki({ text: "" }) ?? ""
			);

			table.rows.push({
				attributes: hero.enable
					? ""
					: hero.empty
					? `style="background-color: #90ee90; color: #1e1e1e;" title="環境"`
					: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
				ceils: [
					hero.id,
					hero.model,
					hero.empty ? "環境" : heroSlotIconTemplate(hero.slot),
					hero.toWiki(),
					skillbooks.join(""),
					hero.atk,
					hero.hp,
					hero.revive || "",
					hero.storyChapter?.title
						? wikiPageLink(
								"Chapter",
								hero.storyChapter.title,
								hero.storyChapter.id
						  )
						: "",
					hero.resonanceItem?.toWiki({
						text: "",
						count: undefined,
					}) ?? "",
				],
			});
		}

		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}

export function wikiHeroesJson() {
	const sortedHeroes = getSortedHeroes();
	return sortedHeroes
		.filter((hero) => hero.enable)
		.map((hero) => hero.toJSON());
}
