import * as _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { call2, gamedataString, localizationCharacterNameByHeroId, localizationString, rank, semicolon } from "../localization";
import { Hero } from './../model/hero';
import { HeroSkillSet } from './../model/hero-skillset';

const FreeHeroesTable = ImperiumData.fromGamedata().getTable("FreeHeroes");

export default function wikiFreeHeroes() {
	const advs = FreeHeroesTable.filter(row => semicolon(call2(gamedataString("Chapters", "id", "title"), localizationString("RegionName")))(row.get('chapterIds')).includes('幻境試煉'));
	const advGroups = _.groupBy(advs, row => row.get('groupId'));
	let out = `== 幻境試煉 ==
{| class="wikitable"
! groupId
! 角色
! 階級
! 技能組`;
	for (const [groupId, group] of Object.entries(advGroups)) {
		for (let i = 0; i < group.length; i++) {
			const row = group[i];
			const heroId: string = row.get('heroId');
			const hero = Hero.get(heroId)?.toWikiSmallIcon() ?? localizationCharacterNameByHeroId()(heroId);
			const skillSets = HeroSkillSet.getList(row.get('skillSetIds'));
			out += `\n|-${i === 0 ? `\n| rowspan="${group.length}" | ${groupId}` : ''}
| ${hero}
| ${rank()(row.get('rank'))}
| ${skillSets.map(s => typeof s === 'string' ? s : `(${s.rankPlus})${s.name}`).join('<br/>')}`;
		}
	}
	out += `\n|}`;
	return out;
}
