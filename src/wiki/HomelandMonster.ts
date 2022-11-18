import _ from "lodash";
import numeral from "numeral";
import { ImperiumData } from "../imperium-data";
import { gbw, localizationCharacterName, localizationMonsterSkillName, localizationMonsterSpecialityName, localizationString } from "../localization";
import { wikiH1, wikiHr } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { wikiNextLine } from "../wiki-utils";

const AbilityDropTable = ImperiumData.fromGamedata().getTable("AbilityDrop");
const HomelandMonsterTable = ImperiumData.fromGamedata().getTable("HomelandMonster");

function abilityDrop(groupId: string) {
	const entries = AbilityDropTable.filter(r => r.get("groupId") == groupId);
	const weightSum = _.sumBy(entries, (r) => +r.get('weight'));
	return entries.map(r => {
		let str: string = r.get("abilityId");
		switch (r.get("type")) {
			case "Skill":
				str = localizationMonsterSkillName()(r.get("abilityId"));
				break;
			case "Speciality":
				str = localizationMonsterSpecialityName()(r.get("abilityId"));
				break;
		}
		str = `${wikiimage(`${str}_Icon.png`, { width: 24 })} ${str}`;
		if (weightSum && r.get("weight") != weightSum) {
			str += `：${numeral(r.get("weight") / weightSum).format('0.[00]%')}`;
		}
		return str;
	}).join("\n");
}

export default function wikiHomelandMonster() {
	let out = wikiH1('獸廄野獸');

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

	const monsters = _.groupBy(HomelandMonsterTable.rows, (r) => r.get("monsterId"));
	for (const [, group] of Object.entries(monsters)) {
		const monsterFirst = group[0];
		const name = localizationCharacterName()(monsterFirst.get("keyName")) || monsterFirst.get("keyName");

		const speciality1List = Object.entries(_.groupBy(group, (r) => r.get("speciality1")))
			.map(([speciality1, group1]) => {
				const ranks: string[] = group1.map(r => r.get("rank"));
				return `rank ${ranks.join(", ")}:\n${abilityDrop(speciality1)}`;
			})
			.join(`\n${wikiHr()}\n`);

		const speciality2List = Object.entries(_.groupBy(group, (r) => r.get("speciality2")))
			.map(([speciality2, group2]) => {
				const ranks: string[] = group2.map(r => r.get("rank"));
				return `rank ${ranks.join(", ")}:\n${abilityDrop(speciality2)}`;
			})
			.join(`\n${wikiHr()}\n`);

		table.push([
			`{{站位圖標|${gbw()(monsterFirst.get("monsterType"))}位}}`,
			{
				attributes: `style="text-align: center; width: 70px;"`,
				text: `{{野獸圖標|${name}}}`,
			},
			localizationString("MonsterInfo")(monsterFirst.get("monsterDescKey")),
			wikiNextLine(abilityDrop(monsterFirst.get("skill1"))),
			wikiNextLine(abilityDrop(monsterFirst.get("skill2"))),
			wikiNextLine(speciality1List),
			wikiNextLine(speciality2List),
		]);
	}

	out += `\n${wikitable(table)}`;

	return out;
}
