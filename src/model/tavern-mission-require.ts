import numeral from "numeral";
import { ImperiumData, RowWrapper } from "../imperium-data";
import { wikiimage } from "../templates/wikiimage";
import { LookupTableCategory } from "./enums/lookup-table-category.enum";
import { TavernMissionSkillType } from "./enums/tavern-mission-skill-type.enum";
import { Mission } from "./mission";
import { MonsterSkill } from "./monster-skill";
import { TavernMission } from "./tavern-mission";

const TavernMissionRequireTable = ImperiumData.fromGamedata().getTable("TavernMissionRequire");

const instances: Record<string, TavernMissionRequire[]> = {};

export class TavernMissionRequire {
	public static get(id: string): TavernMissionRequire[];
	public static get(mission: TavernMission): TavernMissionRequire[];
	public static get(idOrMission: string | TavernMission): TavernMissionRequire[] {
		const id = typeof idOrMission === "string" ? idOrMission : idOrMission.id;
		if (!instances[id]) {
			const rows = TavernMissionRequireTable.filter((r) => r.get("missionId") == id);
			instances[id] = rows.map((row) => new TavernMissionRequire(row));
		}
		return instances[id];
	}

	get missionId(): string {
		return this.row.get("missionId");
	}
	get mission(): Mission | undefined {
		return Mission.get(this.missionId);
	}

	get category(): TavernMissionSkillType {
		return this.row.get("category");
	}

	get skillId(): string {
		return this.row.get("skillId");
	}
	get skillLv(): number {
		return +this.row.get("skillLv");
	}

	#skill: MonsterSkill | undefined | null = null;
	get skill(): MonsterSkill | undefined {
		if (this.#skill === null) {
			this.#skill = MonsterSkill.getBySkillId(this.skillId, this.skillLv);
		}
		return this.#skill;
	}

	get successRate(): number {
		return +this.row.get("successRate");
	}

	constructor(private row: RowWrapper) {}

	getSuccessRateString() {
		return numeral(this.successRate / 10000).format("0.[00]%");
	}

	getCategoryIcon() {
		switch (this.category) {
			case TavernMissionSkillType.ReturnToZero:
				return wikiimage({
					category: LookupTableCategory.Monster_SpSkillIcon,
					key: "expedition_success_debuff",
					width: 24,
				});
			case TavernMissionSkillType.ReduceTime:
				return wikiimage({
					category: LookupTableCategory.Monster_SpSkillIcon,
					key: "expedition_time_debuff",
					width: 24,
				});
		}
		return "";
	}

	toWiki(): string {
		return `${this.skill?.toWiki({ width: 24, text: "" })}${this.getCategoryIcon()}`;
	}
}
