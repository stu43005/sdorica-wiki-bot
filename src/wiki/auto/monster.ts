import MWBot from "mwbot";
import { ImperiumData } from "../../imperium-data.js";
import { TemplateFormatter } from "../../lib/TemplateFormatter.js";
import {
	gbw,
	localizationCharacterName,
	localizationMonsterSkillName,
	localizationMonsterSpecialityName,
	localizationString,
} from "../../localization.js";
import { arrayUnique } from "../../utils.js";
import { wikitemplate } from "../../wiki-utils.js";

const AbilityDropTable = ImperiumData.fromGamedata().getTable("AbilityDrop");
const HomelandMonsterTable = ImperiumData.fromGamedata().getTable("HomelandMonster");
const MonsterSkillTable = ImperiumData.fromGamedata().getTable("MonsterSkill");
const MonsterSpecialityTable = ImperiumData.fromGamedata().getTable("MonsterSpeciality");

const skip = ["嗜血軟泥怪", "巨蠍", "壞蛋", "漂浮水母", "脫毛棉花鼠", "滑翔蜈蚣"];

export async function wikiMonsterBot(bot: MWBot) {
	const skillIds = arrayUnique(MonsterSkillTable.rows.map((r) => r.get("skillId")));
	for (let i = 0; i < skillIds.length; i++) {
		const skillId = skillIds[i];
		const skill = MonsterSkillTable.find((r) => r.get("skillId") == skillId);
		if (skill) {
			const name = localizationString("MonsterSkill")(skill.get("skillKeyName"));
			const desc = localizationString("MonsterSkill")(skill.get("skillKeyDescription"));
			await bot.editOnDifference(`模板:野獸技能/${name}`, desc);
		}
	}

	for (let i = 0; i < MonsterSpecialityTable.length; i++) {
		const speciality = MonsterSpecialityTable.get(i);
		const name = localizationString("MonsterSkill")(speciality.get("specialityKeyName"));
		const desc = localizationString("MonsterSkill")(speciality.get("specialityKeyDescription"));
		const category = speciality.get("category");
		const content = `{{野獸特長/Entry|{{{1|}}}|${desc}|cat=${category}}}`;
		await bot.editOnDifference(`模板:野獸特長/${name}`, content);
	}

	const monsterIds = arrayUnique(HomelandMonsterTable.rows.map((r) => r.get("monsterId")));
	for (let i = 0; i < monsterIds.length; i++) {
		const monsterId = monsterIds[i];
		const monsters = HomelandMonsterTable.filter((r) => r.get("monsterId") == monsterId);
		const monsterFirst = monsters[0];
		const name = localizationCharacterName()(monsterFirst.get("keyName"));
		if (!name || skip.includes(name)) continue;

		const args: Record<string, any> = {
			野獸名稱: name,
			野獸說明: localizationString("MonsterInfo")(monsterFirst.get("monsterDescKey")) || " ",
			野獸位置: gbw()(monsterFirst.get("monsterType")) || " ",
			技能1: abilityDrop(monsterFirst.get("skill1")) || " ",
			技能2: abilityDrop(monsterFirst.get("skill2")) || " ",
			特長1: abilityDrop(monsterFirst.get("speciality1")) || " ",
			特長2: abilityDrop(monsterFirst.get("speciality2")) || " ",
		};
		const template = wikitemplate("野獸頁面", args, TemplateFormatter.FORMAT.BLOCK);

		// const online = await bot.readText(name, false);
		// if (template != online) {
		// 	console.log(`!!! 變更: ${name}`);
		// }
		await bot.editOnDifference(name, template);
	}
}

function abilityDrop(groupId: string) {
	const entries = AbilityDropTable.filter((r) => r.get("groupId") == groupId);
	return entries
		.map((r) => {
			let str = "";
			switch (r.get("type")) {
				case "Skill":
					str = localizationMonsterSkillName()(r.get("abilityId"));
					break;
				case "Speciality":
					str = localizationMonsterSpecialityName()(r.get("abilityId"));
					break;
			}
			return str;
		})
		.join(",");
}
