import { render } from "preact-render-to-string";
import { AssetbundleLookupTable } from "../assetbundle/assetbundle-lookup-table.js";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import {
	MonsterSkillIconParams,
	monsterSkillIconTemplate,
} from "../templates/monster-skill-icon.js";
import { LookupTableCategory } from "./enums/custom/lookup-table-category.enum.js";
import { IMonsterAbility } from "./monster-ability.interface.js";

const MonsterSkillTable = ImperiumData.fromGamedata().getTable("MonsterSkill");

const instances: Record<string, MonsterSkill> = {};
let allInstances: MonsterSkill[] | null = null;

export class MonsterSkill implements IMonsterAbility {
	public static get(id: string): MonsterSkill | undefined;
	public static get(row: RowWrapper): MonsterSkill;
	public static get(rowOrId: RowWrapper | string): MonsterSkill {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? MonsterSkillTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new MonsterSkill(row);
			}
		}
		return instances[id];
	}

	public static getBySkillId(skillId: string, skillLv = 1) {
		return this.find((skill) => skill.skillId === skillId && skill.skillLv === skillLv);
	}

	public static find(predicate: (value: MonsterSkill) => boolean): MonsterSkill | undefined {
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
		for (let i = 0; i < MonsterSkillTable.length; i++) {
			const row = MonsterSkillTable.get(i);
			yield MonsterSkill.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get skillId(): string {
		return this.row.get("skillId");
	}
	get skillLv(): number {
		return +this.row.get("skillLv");
	}
	private get skillrank(): number {
		return +this.row.get("skillrank");
	}

	name: string;
	description: string;

	get iconKey(): string {
		return this.row.get("iconKey");
	}

	constructor(private row: RowWrapper) {
		this.name = localizationString("MonsterSkill")(row.get("skillKeyName"));
		this.description = localizationString("MonsterSkill")(row.get("skillKeyDescription"));
	}

	public getIconAssetUrl(): string | undefined {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.MonsterSkillIcon,
			this.iconKey,
		);
	}

	public toWiki(options?: MonsterSkillIconParams): string {
		return render(monsterSkillIconTemplate(this, options));
	}
}
