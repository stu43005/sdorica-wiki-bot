import { render } from "preact-render-to-string";
import { AssetbundleLookupTable } from "../assetbundle-lookup-table.js";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import {
	MonsterSkillIconParams,
	monsterSkillIconTemplate,
} from "../templates/monster-skill-icon.js";
import { range } from "../utils.js";
import { GiveType } from "./enums/give-type.enum.js";
import { LookupTableCategory } from "./enums/custom/lookup-table-category.enum.js";
import { SpecialCategory } from "./enums/special-category.enum.js";
import { IMonsterAbility } from "./monster-ability.interface.js";

const MonsterSpecialityTable = ImperiumData.fromGamedata().getTable("MonsterSpeciality");

const instances: Record<string, MonsterSpeciality> = {};
let allInstances: MonsterSpeciality[] | null = null;

export class MonsterSpeciality implements IMonsterAbility {
	public static get(id: string): MonsterSpeciality | undefined;
	public static get(row: RowWrapper): MonsterSpeciality;
	public static get(rowOrId: RowWrapper | string): MonsterSpeciality {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? MonsterSpecialityTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new MonsterSpeciality(row);
			}
		}
		return instances[id];
	}

	public static find(
		predicate: (value: MonsterSpeciality) => boolean,
	): MonsterSpeciality | undefined {
		for (const item of this) {
			if (predicate(item)) {
				return item;
			}
		}
		return;
	}

	public static getAll() {
		return (allInstances ??= Array.from(this));
	}

	public static *[Symbol.iterator]() {
		for (let i = 0; i < MonsterSpecialityTable.length; i++) {
			const row = MonsterSpecialityTable.get(i);
			yield MonsterSpeciality.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get category(): SpecialCategory {
		return this.row.get("category");
	}

	name: string;
	description: string;

	get iconKey(): string {
		return this.row.get("iconKey");
	}

	get param1(): string {
		return this.row.get("param1");
	}
	get param2(): string {
		return this.row.get("param2");
	}
	get param3(): string {
		return this.row.get("param3");
	}
	get param4(): GiveType {
		return this.row.get("param4");
	}

	get gemConversion(): number {
		return +this.row.get("gemConversion");
	}
	get maxGem(): number {
		return +this.row.get("maxGem");
	}
	get releaseValueConversion(): number {
		return +this.row.get("releaseValueConversion");
	}
	get maxreleaseValue(): number {
		return +this.row.get("maxreleaseValue");
	}

	get chance() {
		return range(1, 12).map((i) => +this.row.get(`chance${i}`));
	}

	constructor(private row: RowWrapper) {
		this.name = localizationString("MonsterSkill")(row.get("specialityKeyName"));
		this.description = localizationString("MonsterSkill")(row.get("specialityKeyDescription"));
	}

	public getIconAssetUrl(): string | undefined {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.Monster_SpSkillIcon,
			this.iconKey,
		);
	}

	public toWiki(options?: MonsterSkillIconParams): string {
		return render(monsterSkillIconTemplate(this, options));
	}
}
