import { Hero } from "../model/hero";
import { heroSlotIconTemplate } from "../templates/hero-slot-icon";
import { tooltipTemplate } from "../templates/tooltip";
import { sortByCharacterModelNo } from "../utils";

function getSortedHeroes() {
	return Hero.getAll().sort((a, b) => {
		if (a.empty && !b.empty) return 1;
		if (!a.empty && b.empty) return -1;
		return sortByCharacterModelNo(a.model, b.model);
	});
}

export default function wikiHeroes() {
	const out: string[] = [`{| class="wikitable table-responsive-autowrap" style="word-break: break-word;"
! width="6%" | id
! width="10%" | 模組
! width="6%" | 站位
! 名稱
! 技能書
! width="6%" | 攻擊
! width="6%" | 體力
! width="6%" | 復活
! 角色故事
! 共鳴材料`];
	const sortedHeroes = getSortedHeroes();
	for (const hero of sortedHeroes) {
		let name = hero.enable ? hero.toWikiSmallIcon() : hero.firstname;
		if (hero.firstname != hero.internalName) {
			name = tooltipTemplate(name, hero.internalName);
		}
		const skillbooks = hero.books.map(book => book.getBookItem()?.toWiki(undefined, { text: "" }) ?? '');

		out.push(`|-${hero.enable ? "" : hero.empty ? ` style="background-color: #90ee90" title="環境"` : ` style="background-color: #ccc" title="停用"`}
| ${hero.id}
| ${hero.model}
| ${hero.empty ? "環境" : heroSlotIconTemplate(hero.slot)}
| ${name}
| ${skillbooks.join('')}
| ${hero.atk}
| ${hero.hp}
| ${hero.revive || ''}
| ${hero.storyChapter?.title ? `[[${hero.firstname}《${hero.storyChapter.title}》|${hero.storyChapter.title}]]` : ""}
| ${hero.resonanceItem?.toWiki({ text: "", count: undefined }) ?? ""}`);
	}
	out.push(`|}`);

	return out.join("\n");
}

export function wikiHeroesJson() {
	const sortedHeroes = getSortedHeroes();
	return sortedHeroes.filter(hero => hero.enable).map(hero => hero.toJSON());
}
