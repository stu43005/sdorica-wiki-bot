import numeral from "numeral";
import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationMonsterSkillName } from "../localization";
import { TavernMissionSkillType } from "./enums/tavern-mission-skill-type.enum";
import { Mission } from "./mission";
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
	skillName: string;
	get skillLv(): number {
		return +this.row.get("skillLv");
	}
	get successRate(): number {
		return +this.row.get("successRate");
	}

	constructor(private row: RowWrapper) {
		this.skillName = localizationMonsterSkillName()(this.skillId);
	}

	getSuccessRateString() {
		return numeral(this.successRate / 10000).format("0.[00]%");
	}

	getCategoryIcon() {
		switch (this.category) {
			case TavernMissionSkillType.ReturnToZero:
				return "{{系統圖標|任務骷顱頭|24px}}";
			case TavernMissionSkillType.ReduceTime:
				return "{{系統圖標|任務時鐘|24px}}";
		}
		return "";
	}

	toWiki() {
		return `{{狀態圖示|${this.skillName}|24px|層數=${this.skillLv}}}${this.getCategoryIcon()}`;
	}
}
