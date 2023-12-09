import * as _ from "lodash-es";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { MonsterSkillIconParams } from "../templates/monster-skill-icon.js";
import { wikiul } from "../templates/wikilist.js";
import { wikiNextLine } from "../wiki-utils.js";
import { AbilityType } from "./enums/ability-type.enum.js";
import { IMonsterAbility } from "./monster-ability.interface.js";
import { MonsterSkill } from "./monster-skill.js";
import { MonsterSpeciality } from "./monster-speciality.js";
import numeral from "numeral";

const AbilityDropTable = ImperiumData.fromGamedata().getTable("AbilityDrop");

const instances: Record<string, MonsterAbilityDropGroup> = {};

export class MonsterAbilityDropGroup {
	public static get(groupId: string): MonsterAbilityDropGroup | undefined {
		if (!instances[groupId]) {
			const rows = AbilityDropTable.filter((r) => r.get("groupId") == groupId);
			if (!rows.length) {
				return undefined;
			}
			instances[groupId] = new MonsterAbilityDropGroup(rows);
		}
		return instances[groupId];
	}

	private first: RowWrapper;
	public abilities: MonsterAbilityDrop[];

	get groupId(): string {
		return this.first.get("groupId");
	}
	get type(): AbilityType {
		return this.first.get("type");
	}

	constructor(rows: RowWrapper[]) {
		this.first = rows[0];

		const weightSum = _.sumBy(rows, (r) => +r.get("weight"));
		this.abilities = rows
			.map(
				(r) =>
					new MonsterAbilityDrop(
						r.get("type"),
						r.get("abilityId"),
						(r.get("weight") / weightSum) * 10000,
					),
			)
			.sort((a, b) => b.chance - a.chance);
	}

	toWiki(
		options?: MonsterSkillIconParams & {
			listType?: "ul" | "br" | "none" | "separator";
			separator?: string;
		},
	) {
		const list = this.abilities.map((item) => item.toWiki(options));
		switch (options?.listType) {
			case "ul":
			default:
				return wikiul(list);
			case "br":
				return wikiNextLine(list.join("\n"));
			case "none":
				return list.join("");
			case "separator":
				return list.join(options?.separator ?? "\n");
		}
	}
}

export class MonsterAbilityDrop {
	ability: IMonsterAbility | undefined;

	constructor(
		public type: AbilityType,
		public abilityId: string,
		public chance: number,
	) {
		switch (this.type) {
			case AbilityType.Skill:
				this.ability = MonsterSkill.getBySkillId(this.abilityId);
				break;
			case AbilityType.Speciality:
				this.ability = MonsterSpeciality.get(this.abilityId);
				break;
		}
	}

	getChanceString() {
		return numeral(this.chance / 10000).format("0.[00]%");
	}

	toWiki(options?: MonsterSkillIconParams) {
		return (
			this.ability?.toWiki(options) +
			(this.chance === 10000 || this.chance < 0 ? "" : `：${this.getChanceString()}`)
		);
	}
}
