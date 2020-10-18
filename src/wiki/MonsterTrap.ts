import { ImperiumData } from "../imperium-data";
import { gamedataString, localizationCharacterName, localizationItemName, localizationMonsterSkillName, localizationMonsterSpecialityName } from "../localization";
import { arrayUnique } from "../utils";

const AbilityDropTable = ImperiumData.fromGamedata().getTable("AbilityDrop");
const DropItemsTable = ImperiumData.fromGamedata().getTable("DropItems");
const HomelandMonsterTable = ImperiumData.fromGamedata().getTable("HomelandMonster");

export function wikiMonsterTrapJson() {
	const MonsterTrapDropItemsTable = DropItemsTable.filter(r => r.get("giveType") == "Monster");
	const MonsterTrapGroupIds = arrayUnique(MonsterTrapDropItemsTable.map(r => r.get("groupId")));

	const out: {
		items: Record<string, { weight: number, id: string }[]>,
		monsters: Record<string, Record<string, [string, string, string, string]>>,
		ability: Record<string, { weight: number, id: string }[]>,
	} = {
		items: {},
		monsters: {},
		ability: {},
	};

	for (let i = 0; i < MonsterTrapGroupIds.length; i++) {
		const groupId = MonsterTrapGroupIds[i];
		const itemId = gamedataString("ExploreItems", "effectValue", "id")(groupId);
		const itemName = localizationItemName(true)(itemId);
		if (itemName) {
			const group = MonsterTrapDropItemsTable.filter(r => r.get("groupId") == groupId);
			out.items[itemName] = group.map(r => {
				const monster = HomelandMonsterTable.find(mr => mr.get("id") == r.get("giveLinkId"));
				let id = r.get("giveLinkId");
				if (monster) {
					const monsterName = localizationCharacterName()(monster.get("keyName"));
					const rank = monster.get("rank");
					id = `${monsterName}:${rank}`;
					if (!out.monsters[monsterName]) {
						out.monsters[monsterName] = {};
					}
					out.monsters[monsterName][rank] = [monster.get("skill1"), monster.get("skill2"), monster.get("speciality1"), monster.get("speciality2")];
					for (let j = 0; j < out.monsters[monsterName][rank].length; j++) {
						const k = out.monsters[monsterName][rank][j];
						out.ability[k] = [];
					}
				}
				return {
					weight: r.get("value"),
					id: id,
				};
			});
		}
	}

	const AbilityGroupIds = Object.keys(out.ability);
	for (let i = 0; i < AbilityGroupIds.length; i++) {
		const groupId = AbilityGroupIds[i];
		const group = AbilityDropTable.filter(r => r.get("groupId") == groupId);
		out.ability[groupId] = group.map(r => ({
			weight: r.get("weight"),
			id: r.get("type") == "Skill" ? localizationMonsterSkillName()(r.get("abilityId")) : localizationMonsterSpecialityName()(r.get("abilityId")),
		}));
	}

	return out;
}
