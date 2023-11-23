import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { HeroRankParams, heroRankTemplate } from "../templates/hero-rank";
import { heroSkinTemplate } from "../templates/hero-skin";
import { HeroSmallIconParams } from "../templates/hero-small-icon";
import { HeroRank } from "./enums/hero-rank.enum";
import { HeroSkillType } from "./enums/hero-skill-type.enum";
import { ItemCategory } from "./enums/item-category.enum";
import { SkillId } from "./enums/skill-id.enum";
import { SkillType } from "./enums/skill-type.enum";
import { StoneEraseShape } from "./enums/stone-erase-shape.enum";
import { StoneEraseType } from "./enums/stone-erase-type.enum";
import { Hero } from "./hero";
import { HeroInfo } from "./hero-info";
import { HeroSkill } from "./hero-skill";
import { HeroSkillLevel } from "./hero-skilllevel";
import { IHeroSkillSet } from "./hero-skillset.interface";
import { Item } from "./item";

const HeroSkillsTable = ImperiumData.fromGamedata().getTable("HeroSkills");

const instances: Record<string, HeroSkillSet> = {};
let allInstances: HeroSkillSet[] | null = null;

export class HeroSkillSet implements IHeroSkillSet {
	public static get(row: RowWrapper): HeroSkillSet;
	public static get(id: string): HeroSkillSet | undefined;
	public static get(rowOrId: RowWrapper | string): HeroSkillSet {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? HeroSkillsTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new HeroSkillSet(row);
			}
		}
		return instances[id];
	}

	public static getByHeroId(heroId: string): HeroSkillSet[] {
		const rows = HeroSkillsTable.filter((s) => s.get("heroId") == heroId);
		const skillSets = rows.map((row) => HeroSkillSet.get(row));
		return skillSets;
	}

	public static getByModel(skillSet: string): IHeroSkillSet | undefined {
		return HeroSkillSet.find((s) => s.model == skillSet) ?? HeroSkillLevel.getByModel(skillSet);
	}

	public static getList(list: string | string[]): (HeroSkillSet | string)[] {
		if (typeof list === "string") {
			list = list.split(";");
		}
		return list.map((str) => this.get(str) ?? str);
	}

	private static find(predicate: (value: HeroSkillSet) => boolean): HeroSkillSet | undefined {
		for (const item of this.getAllGenerator()) {
			if (predicate(item)) {
				return item;
			}
		}
	}

	public static getAll() {
		return (allInstances ??= Array.from(this.getAllGenerator()));
	}

	public static *getAllGenerator() {
		for (let i = 0; i < HeroSkillsTable.length; i++) {
			const row = HeroSkillsTable.get(i);
			yield HeroSkillSet.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get heroId(): string {
		return this.row.get("heroId");
	}
	get hero() {
		return Hero.get(this.heroId);
	}

	get model(): string {
		return this.row.get("skillSet");
	}
	name: string;

	get type(): HeroSkillType {
		return this.row.get("heroSkillType");
	}
	get rankId(): number {
		return +this.row.get("rank");
	}
	get rank(): HeroRank {
		return this.getRank();
	}
	get rankPlus(): string {
		return this.rank;
	}
	get isBook(): boolean {
		return this.isAlt || this.isSkin;
	}
	get isAlt(): boolean {
		return this.rank === HeroRank.Alt;
	}
	get isSkin(): boolean {
		return this.rank === HeroRank.Skin;
	}

	get revive(): number {
		return +this.row.get("revive");
	}
	get initCD(): number {
		return +this.row.get("initCD");
	}
	get skillLv(): number {
		return 0;
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
		return false;
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

	#info: HeroInfo | null = null;
	get info(): HeroInfo {
		return (this.#info ??= new HeroInfo(this.model));
	}

	#skillLevels: HeroSkillLevel[] | null = null;
	get skillLevels() {
		return (this.#skillLevels ??= HeroSkillLevel.getBySkillSetId(this.id));
	}

	#bookItem: Item | undefined | null = null;
	get bookItem(): Item | undefined {
		if (this.#bookItem === null) {
			this.#bookItem = Item.find(
				(item) =>
					item.category == ItemCategory.HeroSkill &&
					item.effectValue.toString() == this.id
			);
		}
		return this.#bookItem;
	}

	constructor(private row: RowWrapper) {
		this.name = localizationString("HeroSkills", "skill_set_")(this.id);

		this.P1 = new HeroSkill(this, SkillId.P1, SkillType.P1, StoneEraseShape.None, this.tipsP1);
		this.A1 = new HeroSkill(this, SkillId.A1, SkillType.A1, StoneEraseShape.None, this.tipsA1);
		this.S1 = HeroSkill.createByEraseType(this, SkillId.S1, this.stoneEraseTypeS1, this.tipsS1);
		this.S2 = HeroSkill.createByEraseType(this, SkillId.S2, this.stoneEraseTypeS2, this.tipsS2);
		this.S3 = HeroSkill.createByEraseType(this, SkillId.S3, this.stoneEraseTypeS3, this.tipsS3);
	}

	private getRank() {
		switch (this.rankId) {
			case 2:
				return HeroRank.N;
			case 3:
				return HeroRank.R;
			case 4:
				return HeroRank.SR;
			case 5:
				return HeroRank.SSR;
		}
		switch (this.type) {
			case HeroSkillType.SkillBook:
				return HeroRank.Alt;
			case HeroSkillType.Skin:
				return HeroRank.Skin;
		}
		const bookItemName = this.bookItem?.name.replace(/【.*】/, "");
		switch (bookItemName) {
			case "技能書":
				return HeroRank.Alt;
			case "造型書":
				return HeroRank.Skin;
		}
		return HeroRank.Unknown;
	}

	static toWikiPage(self: IHeroSkillSet) {
		if (self.isSkin && self.name != "冬青少女") {
			const skinParams = {
				角色位置: self.hero?.slot,
				角色名稱: self.hero?.firstname,
				角色姓氏: self.hero?.lastname,
				角色稱號: self.name,
			};
			Object.assign(skinParams, self.S1.getWikiTemplateParams(true));
			Object.assign(skinParams, self.S2.getWikiTemplateParams(true));
			Object.assign(skinParams, self.S3.getWikiTemplateParams(true));
			Object.assign(skinParams, self.P1.getWikiTemplateParams(true));
			Object.assign(skinParams, self.A1.getWikiTemplateParams(true));
			return heroSkinTemplate(skinParams);
		}

		const params: HeroRankParams = {
			角色位置: self.hero?.slot,
			角色名稱: self.hero?.firstname,
			角色姓氏: self.hero?.lastname,
			角色稱號: self.name,
			共鳴階級: self.rank,
			技能強化: self.skillLv,
			復活: self.revive,
		};
		Object.assign(params, self.S1.getWikiTemplateParams());
		Object.assign(params, self.S2.getWikiTemplateParams());
		Object.assign(params, self.S3.getWikiTemplateParams());
		Object.assign(params, self.P1.getWikiTemplateParams());
		Object.assign(params, self.A1.getWikiTemplateParams());
		Object.assign(params, <HeroRankParams>{
			共鳴材料: !self.isBook ? self.hero?.resonanceItem?.item?.name ?? "{{?}}" : "",
			介紹: self.info?.info1,
			年齡: self.info?.age,
			身高: self.info?.height,
			聲優: self.info?.cv,
		});
		return heroRankTemplate(params);
	}

	toWiki(options?: HeroSmallIconParams) {
		return `${this.hero?.toWiki(options)} (${this.rank})`;
	}

	toJSON(minify?: boolean) {
		if (minify) {
			return {
				id: this.id,
				type: this.type,
				model: this.model,
				name: this.name,
				rank: this.rankPlus,
			};
		}
		return {
			id: this.id,
			type: this.type,
			model: this.model,
			name: this.name,
			rank: this.rankPlus,
			revive: this.revive,
			S1: this.S1,
			S2: this.S2,
			S3: this.S3,
			P1: this.P1,
			A1: this.A1,
			hero: this.hero?.toJSON(true),
		};
	}
}
