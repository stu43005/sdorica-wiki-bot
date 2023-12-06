import render from "preact-render-to-string";
import { AssetbundleLookupTable } from "../assetbundle-lookup-table";
import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationCharacterName, localizationString } from "../localization";
import { MonsterIconParams, monsterIconTemplate } from "../templates/monster-icon";
import { range } from "../utils";
import { LookupTableCategory } from "./enums/lookup-table-category.enum";
import { ItemPayRef } from "./item-pay-ref";
import { MonsterAbilityDropGroup } from "./monster-ability-drop";

const HomelandMonsterTable = ImperiumData.fromGamedata().getTable("HomelandMonster");
const MonsterRankTable = ImperiumData.fromGamedata().getTable("MonsterRank");

const instances: Record<string, Monster> = {};
let allInstances: Monster[] | null = null;

export class Monster {
	public static get(id: string): Monster | undefined;
	public static get(row: RowWrapper): Monster;
	public static get(rowOrId: RowWrapper | string): Monster {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? HomelandMonsterTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new Monster(row);
			}
		}
		return instances[id];
	}

	public static getByMonsterId(monsterId: string): Monster[] {
		const rows = HomelandMonsterTable.filter((r) => r.get("monsterId") == monsterId);
		const buildings = rows.map((row) => Monster.get(row)).sort((a, b) => a.rank - b.rank);
		return buildings;
	}

	public static find(predicate: (value: Monster) => boolean): Monster | undefined {
		for (const item of this) {
			if (predicate(item)) {
				return item;
			}
		}
	}

	public static getAll() {
		return (allInstances ??= Array.from(this));
	}

	public static *[Symbol.iterator]() {
		for (let i = 0; i < HomelandMonsterTable.length; i++) {
			const row = HomelandMonsterTable.get(i);
			yield Monster.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}
	get monsterId(): string {
		return this.row.get("monsterId");
	}
	get rank(): number {
		return +this.row.get("rank");
	}
	get keyName(): string {
		return this.row.get("keyName");
	}

	name: string;
	description: string;

	get monsterType(): "black" | "white" | "gold" {
		return this.row.get("monsterType");
	}

	/**
	 * 頭像
	 */
	get monsterSd(): string {
		return this.row.get("monsterSd");
	}

	/**
	 * 每小時體力回復
	 */
	get recovery(): number {
		return +this.row.get("recovery");
	}
	get recoveryAdd(): number {
		return +this.row.get("recoveryAdd");
	}
	/**
	 * 體力
	 */
	get stamina(): number {
		return +this.row.get("stamina");
	}
	get staminaAdd(): number {
		return +this.row.get("staminaAdd");
	}
	/**
	 * 野放獲得荒野祝福數量
	 */
	get releaseValue(): number {
		return +this.row.get("releaseValue");
	}

	#rankRow: RowWrapper | undefined | null = null;
	private get rankRow(): RowWrapper | undefined {
		if (this.#rankRow === null) {
			this.#rankRow = MonsterRankTable.find((row) => row.get("id") == this.rank);
		}
		return this.#rankRow;
	}

	#skill1: MonsterAbilityDropGroup | undefined | null = null;
	get skill1(): MonsterAbilityDropGroup | undefined {
		if (this.#skill1 === null) {
			this.#skill1 = MonsterAbilityDropGroup.get(this.row.get("skill1"));
		}
		return this.#skill1;
	}
	get skillLv1(): number {
		return +this.rankRow?.get("skillLv1");
	}
	#skill2: MonsterAbilityDropGroup | undefined | null = null;
	get skill2(): MonsterAbilityDropGroup | undefined {
		if (this.#skill2 === null) {
			this.#skill2 = MonsterAbilityDropGroup.get(this.row.get("skill2"));
		}
		return this.#skill2;
	}
	get skillLv2(): number {
		return +this.rankRow?.get("skillLv2");
	}
	#speciality1: MonsterAbilityDropGroup | undefined | null = null;
	get speciality1(): MonsterAbilityDropGroup | undefined {
		if (this.#speciality1 === null) {
			this.#speciality1 = MonsterAbilityDropGroup.get(this.row.get("speciality1"));
		}
		return this.#speciality1;
	}
	get hasSpeciality1(): boolean {
		return !!this.rankRow?.get("speciality1");
	}
	#speciality2: MonsterAbilityDropGroup | undefined | null = null;
	get speciality2(): MonsterAbilityDropGroup | undefined {
		if (this.#speciality2 === null) {
			this.#speciality2 = MonsterAbilityDropGroup.get(this.row.get("speciality2"));
		}
		return this.#speciality2;
	}
	get hasSpeciality2(): boolean {
		return !!this.rankRow?.get("speciality2");
	}
	#speciality3: MonsterAbilityDropGroup | undefined | null = null;
	get speciality3(): MonsterAbilityDropGroup | undefined {
		if (this.#speciality3 === null) {
			this.#speciality3 = MonsterAbilityDropGroup.get(this.row.get("speciality3"));
		}
		return this.#speciality3;
	}
	get hasSpeciality3(): boolean {
		return !!this.rankRow?.get("speciality3");
	}

	#payItems: ItemPayRef[] | null = null;
	get payItems(): ItemPayRef[] {
		if (this.#payItems === null) {
			this.#payItems = range(1, 4)
				.map(
					(i) =>
						new ItemPayRef(
							this.row.get(`payType${i}`),
							this.row.get(`linkId${i}`),
							this.row.get(`amount${i}`)
						)
				)
				.filter((ref) => !!ref.item);
		}
		return this.#payItems;
	}

	#rankUpRequireMobs: RequireMob[] | null = null;
	get rankUpRequireMobs(): RequireMob[] {
		if (this.#rankUpRequireMobs === null) {
			this.#rankUpRequireMobs = range(1, 5)
				.map(
					(i): RequireMob => ({
						mob: Monster.get(this.row.get(`requireMob${i}Id`)),
						rank: +this.row.get(`requireMob${i}Rank`),
					})
				)
				.filter((req) => req.rank > 0);
		}
		return this.#rankUpRequireMobs;
	}

	#rankUpMob: Monster | undefined | null = null;
	get rankUpMob(): Monster | undefined {
		if (this.#rankUpMob === null) {
			this.#rankUpMob = Monster.find(
				(other) =>
					other.monsterId === this.monsterId &&
					other.rank === this.rank + 1 &&
					other.enable
			);
		}
		return this.#rankUpMob;
	}

	constructor(private row: RowWrapper) {
		this.name = localizationCharacterName()(this.keyName);
		this.description = localizationString("MonsterInfo")(row.get("monsterDescKey"));
	}

	/**
	 * 頭像
	 */
	getSdAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.MonsterImage_SD,
			this.monsterSd
		);
	}
	getMonsterTypeAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.Monster_SpSkillIcon,
			`expedition_frame_${this.monsterType}`
		);
	}

	toWiki(options?: MonsterIconParams) {
		return render(monsterIconTemplate(this, options));
	}
}

type RequireMob = {
	mob: Monster | undefined;
	rank: number;
};
