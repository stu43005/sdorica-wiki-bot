import { ImperiumData } from "../imperium-data";
import { gbw, localizationCharacterName, localizationMonsterSkillName, localizationMonsterSpecialityName, localizationString } from "../localization";
import { arrayUnique } from "../utils";

const AbilityDropTable = ImperiumData.fromGamedata().getTable("AbilityDrop");
const HomelandMonsterTable = ImperiumData.fromGamedata().getTable("HomelandMonster");

function abilityDrop(groupId: string) {
	const entries = AbilityDropTable.filter(r => r.get("groupId") == groupId);
	const weightCount = entries.reduce((prev, cur) => prev + Number(cur.get("weight")), 0);
	return entries.map(r => {
		let str = "";
		switch (r.get("type")) {
			case "Skill":
				str = localizationMonsterSkillName()(r.get("abilityId"));
				break;
			case "Speciality":
				str = localizationMonsterSpecialityName()(r.get("abilityId"));
				break;
		}
		str = `[[檔案:${str}_Icon.png|24px]] ${str}`;
		if (weightCount && r.get("weight") != weightCount) {
			str += `：${Math.floor(r.get("weight") / weightCount * 10000) / 100}%`;
		}
		return str;
	}).join("<br/>");
}

export default function wikiHomelandMonster() {
	const out: string[] = [];
	out.push(`{| class="wikitable"
|-
! 站位
! 名稱
! style="width: 20%" | 說明
! 技能1
! 技能2<br/><small>5星解鎖</small>
! 特長1<br/><small>3星解鎖</small>
! 特長2<br/><small>7星解鎖</small>`);
	const monsterIds = arrayUnique(HomelandMonsterTable.rows.map(r => r.get("monsterId")));
	for (let i = 0; i < monsterIds.length; i++) {
		const monsterId = monsterIds[i];
		const monsters = HomelandMonsterTable.filter(r => r.get("monsterId") == monsterId);
		const monsterFirst = monsters[0];
		const name = localizationCharacterName()(monsterFirst.get("keyName")) || monsterFirst.get("keyName");

		const speciality1s = arrayUnique(monsters.map(r => r.get("speciality1"))).map(n => `rank ${monsters.filter(r => r.get("speciality1") == n).map(r => r.get("rank")).join(", ")}:<br/>${abilityDrop(n)}`).join(`\n----\n`);
		const speciality2s = arrayUnique(monsters.map(r => r.get("speciality2"))).map(n => `rank ${monsters.filter(r => r.get("speciality2") == n).map(r => r.get("rank")).join(", ")}:<br/>${abilityDrop(n)}`).join(`\n----\n`);

		const str = `|-
| {{站位圖標|${gbw()(monsterFirst.get("monsterType"))}位}}
| style="text-align: center; width: 70px;" | [[檔案:${name}_Mob.png|70px]]<br/>[[${name}]]
| ${localizationString("MonsterInfo")(monsterFirst.get("monsterDescKey"))}
| ${abilityDrop(monsterFirst.get("skill1"))}
| ${abilityDrop(monsterFirst.get("skill2"))}
| ${speciality1s}
| ${speciality2s}`;
		out.push(str);
	}
	out.push(`|}`);

	return out.join("\n");
}
