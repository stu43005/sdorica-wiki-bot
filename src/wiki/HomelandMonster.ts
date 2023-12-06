import _ from "lodash";
import { Monster } from "../model/monster";
import { MonsterAbilityDropGroup } from "../model/monster-ability-drop";
import { wikiH1, wikiHr } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { WikiTableStruct, wikitable } from "../templates/wikitable";
import { wikiNextLine } from "../wiki-utils";

export default function wikiHomelandMonster() {
	let out = wikiH1("獸廄野獸");

	const table: WikiTableStruct = [
		[
			`! 站位`,
			`! 名稱`,
			`! style="width: 20%" | 說明`,
			`! 技能1`,
			{
				header: true,
				text: wikiNextLine(`技能2\n<small>5星解鎖</small>`),
			},
			{
				header: true,
				text: wikiNextLine(`特長1\n<small>3星解鎖</small>`),
			},
			{
				header: true,
				text: wikiNextLine(`特長2\n<small>7星解鎖</small>`),
			},
		],
	];

	const monsters = _.groupBy(Monster.getAll(), (r) => r.monsterId);
	for (const [, group] of Object.entries(monsters)) {
		const monsterFirst = group[0];

		const speciality1List = Object.entries(_.groupBy(group, (r) => r.speciality1?.groupId))
			.map(([speciality1, group1]) => {
				const ranks: number[] = group1.map((r) => r.rank);
				const group = MonsterAbilityDropGroup.get(speciality1);
				return `rank ${ranks.join(", ")}:<br/>${group?.toWiki()}`;
			})
			.join(wikiHr());

		const speciality2List = Object.entries(_.groupBy(group, (r) => r.speciality2?.groupId))
			.map(([speciality2, group2]) => {
				const ranks: number[] = group2.map((r) => r.rank);
				const group = MonsterAbilityDropGroup.get(speciality2);
				return `rank ${ranks.join(", ")}:<br/>${group?.toWiki()}`;
			})
			.join(wikiHr());

		table.push([
			wikiimage({
				url: monsterFirst.getMonsterTypeAssetUrl(),
				width: 50,
			}),
			{
				attributes: `style="text-align: center; width: 70px;"`,
				text: monsterFirst.toWiki({
					width: 70,
					direction: "vertical",
					showRank: false,
				}),
			},
			monsterFirst.description,
			monsterFirst.skill1?.toWiki({ listType: "none" }) ?? "",
			monsterFirst.skill2?.toWiki({ listType: "none" }) ?? "",
			speciality1List,
			speciality2List,
		]);
	}

	out += `\n${wikitable(table)}`;

	return out;
}
