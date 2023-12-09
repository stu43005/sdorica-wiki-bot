import { render } from "preact-render-to-string";
import { AssetbundleLookupTable } from "../assetbundle-lookup-table.js";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import { HeroIconParams, heroIconTemplate } from "../templates/hero-icon.js";
import { HeroRankParams, heroRankTemplate } from "../templates/hero-rank.js";
import { heroSkinTemplate } from "../templates/hero-skin.js";
import { HeroRank } from "./enums/custom/hero-rank.enum.js";
import { HeroSkillType } from "./enums/hero-skill-type.enum.js";
import { ItemCategory } from "./enums/item-category.enum.js";
import { LookupTableCategory } from "./enums/custom/lookup-table-category.enum.js";
import { SkillId } from "./enums/custom/skill-id.enum.js";
import { SkillType } from "./enums/custom/skill-type.enum.js";
import { StoneEraseShape } from "./enums/custom/stone-erase-shape.enum.js";
import { StoneEraseType } from "./enums/stone-erase-type.enum.js";
import { Hero } from "./hero.js";
import { HeroInfo } from "./hero-info.js";
import { HeroSkill } from "./hero-skill.js";
import { HeroSkillLevel } from "./hero-skilllevel.js";
import { IHeroSkillSet } from "./hero-skillset.interface.js";
import { Item } from "./item.js";

const HeroSkillsTable = ImperiumData.fromGamedata().getTable("HeroSkills");

const instances: Record<string, HeroSkillSet> = {};
let allInstances: HeroSkillSet[] | null = null;

export class HeroSkillSet implements IHeroSkillSet {
	public static get(id: string): HeroSkillSet | undefined;
	public static get(row: RowWrapper): HeroSkillSet;
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
	/**
	 * 橫幅
	 */
	private get figure(): string {
		return this.row.get("figure");
	}
	/**
	 * 小橫幅
	 */
	private get figureM(): string {
		return this.row.get("figureM");
	}
	/**
	 * 簽名
	 */
	private get heroAg(): string {
		return this.row.get("heroAg");
	}
	/**
	 * 頭像
	 */
	get heroSd(): string {
		return this.row.get("heroSd");
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
					item.effectValue.toString() == this.id,
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

	compare(another: HeroSkillSet): boolean {
		if (this === another) return true;
		return this.id === another.id;
	}

	compareHero(another: Hero | IHeroSkillSet): boolean {
		if (this === another) return true;
		if (another instanceof Hero) {
			return this.heroId === another.id;
		}
		if (another.hero) {
			return this.heroId === another.hero.id;
		}
		return false;
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

	/**
	 * 橫幅
	 */
	getFigureLargeAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.CharacterImage_LARGE,
			this.figure,
		);
	}
	/**
	 * 小橫幅
	 */
	getFigureMidAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.CharacterImage_MID,
			this.figureM,
		);
	}
	/**
	 * 簽名
	 */
	getAutographAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.CharacterAutograph,
			this.heroAg,
		);
	}
	/**
	 * 頭像
	 */
	getSdAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.CharacterImage_SD,
			this.heroSd,
		);
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

	toWiki(options?: HeroIconParams): string {
		return render(heroIconTemplate(this, options));
	}

	toJSON(minify?: boolean): any {
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
