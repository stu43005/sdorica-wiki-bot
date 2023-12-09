import { render } from "preact-render-to-string";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { HeroIconParams, heroIconTemplate } from "../templates/hero-icon.js";
import { range } from "../utils.js";
import { SkillId } from "./enums/custom/skill-id.enum.js";
import { SkillType } from "./enums/custom/skill-type.enum.js";
import { StoneEraseShape } from "./enums/custom/stone-erase-shape.enum.js";
import { StoneEraseType } from "./enums/stone-erase-type.enum.js";
import { HeroSkill } from "./hero-skill.js";
import { IHeroSkillSet } from "./hero-skillset.interface.js";
import { HeroSkillSet } from "./hero-skillset.js";
import { ItemPayList } from "./item-pay-list.js";
import { ItemPayRef } from "./item-pay-ref.js";

const SkillLevelTable = ImperiumData.fromGamedata().getTable("SkillLevel");

const instances: Record<string, HeroSkillLevel> = {};
let allInstances: HeroSkillLevel[] | null = null;

export class HeroSkillLevel implements IHeroSkillSet {
	public static get(id: string): HeroSkillLevel | undefined;
	public static get(row: RowWrapper): HeroSkillLevel;
	public static get(rowOrId: RowWrapper | string): HeroSkillLevel {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? SkillLevelTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new HeroSkillLevel(row);
			}
		}
		return instances[id];
	}

	public static getBySkillSetId(skillSetId: string): HeroSkillLevel[] {
		const rows = SkillLevelTable.filter((s) => s.get("rootSkill") == skillSetId);
		const skillSets = rows.map((row) => HeroSkillLevel.get(row));
		return skillSets;
	}

	public static getByModel(skillSet: string) {
		return HeroSkillLevel.find((s) => s.model == skillSet);
	}

	private static find(predicate: (value: HeroSkillLevel) => boolean): HeroSkillLevel | undefined {
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
		for (let i = 0; i < SkillLevelTable.length; i++) {
			const row = SkillLevelTable.get(i);
			yield HeroSkillLevel.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get rootSkill(): string {
		return this.row.get("rootSkill");
	}
	get rootSkillSet() {
		return HeroSkillSet.get(this.rootSkill);
	}
	get hero() {
		return this.rootSkillSet?.hero;
	}
	get requiredSubrank(): number {
		return +this.row.get("requiredSubrank");
	}
	get skillLv(): number {
		return +this.row.get("skillLv");
	}
	get plus(): string {
		return "+".repeat(+this.skillLv);
	}

	get model(): string {
		return this.row.get("targetSkillSet");
	}
	get heroSd() {
		return this.rootSkillSet?.heroSd;
	}
	get name() {
		return this.rootSkillSet?.name;
	}
	get type() {
		return this.rootSkillSet?.type;
	}
	get rank() {
		return this.rootSkillSet?.rank;
	}
	get rankPlus(): string {
		return `${this.rank}${this.plus}`;
	}
	get isBook() {
		return this.rootSkillSet?.isBook;
	}
	get isAlt() {
		return this.rootSkillSet?.isAlt;
	}
	get isSkin() {
		return this.rootSkillSet?.isSkin;
	}
	get revive() {
		return this.rootSkillSet?.revive;
	}
	get initCD(): number {
		return +this.row.get("initCD");
	}

	P1: HeroSkill;
	A1: HeroSkill;
	S1: HeroSkill;
	S2: HeroSkill;
	S3: HeroSkill;

	get stoneEraseTypeS1(): StoneEraseType {
		return this.row.get("S1");
	}
	get stoneEraseTypeS2(): StoneEraseType {
		return this.row.get("S2");
	}
	get stoneEraseTypeS3(): StoneEraseType {
		return this.row.get("S3");
	}

	get tipsP1(): boolean {
		return !!this.row.get("tipsP1");
	}
	get tipsA1(): boolean {
		return !!this.row.get("tipsA1");
	}
	get tipsS1(): boolean {
		return !!this.row.get("tipsS1");
	}
	get tipsS2(): boolean {
		return !!this.row.get("tipsS2");
	}
	get tipsS3(): boolean {
		return !!this.row.get("tipsS3");
	}

	get info() {
		return this.rootSkillSet?.info;
	}

	#payItems: ItemPayList | null = null;
	get payItems(): ItemPayList {
		if (this.#payItems === null) {
			this.#payItems = new ItemPayList(
				range(1, 4)
					.map(
						(i) =>
							new ItemPayRef(
								this.row.get(`pay${i}Type`),
								this.row.get(`pay${i}LinkId`),
								this.row.get(`pay${i}Amount`),
							),
					)
					.filter((ref) => !!ref.item),
			);
		}
		return this.#payItems;
	}

	constructor(private row: RowWrapper) {
		this.P1 = new HeroSkill(this, SkillId.P1, SkillType.P1, StoneEraseShape.None, this.tipsP1);
		this.A1 = new HeroSkill(this, SkillId.A1, SkillType.A1, StoneEraseShape.None, this.tipsA1);
		this.S1 = HeroSkill.createByEraseType(this, SkillId.S1, this.stoneEraseTypeS1, this.tipsS1);
		this.S2 = HeroSkill.createByEraseType(this, SkillId.S2, this.stoneEraseTypeS2, this.tipsS2);
		this.S3 = HeroSkill.createByEraseType(this, SkillId.S3, this.stoneEraseTypeS3, this.tipsS3);
	}

	toWiki(options?: HeroIconParams): string {
		return render(heroIconTemplate(this, options));
	}

	getSdAssetUrl(): string | undefined {
		return this.rootSkillSet?.getSdAssetUrl();
	}

	toJSON(minify?: boolean): any {
		return HeroSkillSet.prototype.toJSON.apply(this, [minify]);
	}
}
