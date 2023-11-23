import { ImperiumData, RowWrapper } from "../imperium-data";
import { characterNameNormalization, localizationString } from "../localization";
import { heroBaseTemplate } from "../templates/hero-base";
import { heroPageTemplate } from "../templates/hero-page";
import { HeroSmallIconParams, heroSmallIconTemplate } from "../templates/hero-small-icon";
import { tooltipTemplate } from "../templates/tooltip";
import { heroName, pointRegexp } from "../wiki-hero";
import { Chapter } from "./chapter";
import { CharacterSeriesType } from "./enums/character-series-type.enum";
import { GenderType } from "./enums/gender-type.enum";
import { HeroRank } from "./enums/hero-rank.enum";
import { HeroSlot } from "./enums/hero-slot.enum";
import { HeroViewableType } from "./enums/hero-viewable-type.enum";
import { HeroSkillLevel } from "./hero-skilllevel";
import { HeroSkillSet } from "./hero-skillset";
import { ItemPayRef } from "./item-pay-ref";
import { Avatar } from "./avatar";

const HeroesTable = ImperiumData.fromGamedata().getTable("Heroes");
const RankUpItemRefsTable = ImperiumData.fromGamedata().getTable("RankUpItemRefs");

const instances: Record<string, Hero> = {};
let allInstances: Hero[] | null = null;

export class Hero {
	public static get(row: RowWrapper): Hero;
	public static get(id: string): Hero | undefined;
	public static get(rowOrId: RowWrapper | string): Hero {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string" ? HeroesTable.find((r) => r.get("id") == id) : rowOrId;
			if (row) {
				instances[id] = new Hero(row);
			}
		}
		return instances[id];
	}

	public static getBySideStory(chapterOrId: Chapter | string): Hero | undefined {
		const chapterId = typeof chapterOrId === "string" ? chapterOrId : chapterOrId.id;
		return Hero.find((hero) => hero.storyChapter?.id == chapterId);
	}

	public static find(predicate: (value: Hero) => boolean): Hero | undefined {
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
		for (let i = 0; i < HeroesTable.length; i++) {
			const row = HeroesTable.get(i);
			yield Hero.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get model(): string {
		return this.row.get("model");
	}
	get internalName(): string {
		return this.row.get("name");
	}

	fullname: string;
	firstname: string;
	lastname: string;
	englishName: string;
	scName: string;
	japaneseName: string;
	koreanName: string;

	get initRank(): number {
		return +this.row.get("initRank");
	}
	get atk(): number {
		return +this.row.get("atk");
	}
	get hp(): number {
		return +this.row.get("hp");
	}
	/**
	 * 復活所需魂芯
	 *
	 * 以三階為主，如果無則回傳0
	 */
	get revive(): number {
		return this.SSR?.revive ?? this.skillSets[0]?.revive ?? 0;
	}

	get empty(): boolean {
		return !!this.row.get("empty");
	}
	get enable(): boolean {
		// return this.row.get("enable");
		return (
			this.row.get("avatarId") &&
			this.row.get("viewable") != "Invisible" &&
			!this.row.get("empty")
		);
	}

	get slot(): HeroSlot {
		return this.row.get("white")
			? HeroSlot.WHITE
			: this.row.get("black")
			? HeroSlot.BLACK
			: HeroSlot.GOLD;
	}

	#storyChapter: Chapter | null = null;
	get storyChapter(): Chapter | undefined {
		const storyChapter = this.row.get("storyChapter");
		if (!storyChapter) return undefined;
		return (this.#storyChapter ??= Chapter.get(storyChapter));
	}

	get avatarId(): string {
		return this.row.get("avatarId");
	}
	#avatar: Avatar | undefined | null = null;
	get avatar(): Avatar | undefined {
		if (!this.avatarId) return undefined;
		return (this.#avatar ??= Avatar.get(this.avatarId));
	}

	get viewable(): HeroViewableType {
		return this.row.get("viewable");
	}
	get gender(): GenderType {
		return this.row.get("gender");
	}
	get races(): string {
		return this.row.get("races");
	}
	get series(): CharacterSeriesType {
		return this.row.get("series");
	}

	#resonanceItem: ItemPayRef | undefined | null = null;
	get resonanceItem(): ItemPayRef | undefined {
		if (this.#resonanceItem === null) {
			const rankUpItem = RankUpItemRefsTable.find(
				(r) =>
					r.get("category") == "HeroID" &&
					r.get("param1") == this.id &&
					r.get("refId") == "CharItemC"
			);
			if (rankUpItem) {
				this.#resonanceItem = new ItemPayRef(
					rankUpItem.get("payType"),
					rankUpItem.get("payLinkId"),
					rankUpItem.get("payAmount")
				);
			} else {
				this.#resonanceItem = undefined;
			}
		}
		return this.#resonanceItem;
	}

	#skillSets: HeroSkillSet[] | null = null;
	get skillSets(): HeroSkillSet[] {
		return (this.#skillSets ??= HeroSkillSet.getByHeroId(this.id).filter((s) => s.name));
	}
	#skillSetWithLevels: (HeroSkillSet | HeroSkillLevel)[] | null = null;
	get skillSetWithLevels() {
		return (this.#skillSetWithLevels ??= this.skillSets.reduce(
			(p, c) => [...p, c, ...c.skillLevels],
			[] as (HeroSkillSet | HeroSkillLevel)[]
		));
	}
	/**
	 * 技能書及造型書
	 */
	get books() {
		return this.skillSets.filter((s) => s.isBook);
	}
	/**
	 * 技能書
	 */
	get alts() {
		return this.skillSets.filter((s) => s.isAlt);
	}
	/**
	 * 造型書
	 */
	get skins() {
		return this.skillSets.filter((s) => s.isSkin);
	}
	get N() {
		return this.skillSets.find((s) => s.rank === HeroRank.N);
	}
	get R() {
		return this.skillSets.find((s) => s.rank === HeroRank.R);
	}
	get SR() {
		return this.skillSets.find((s) => s.rank === HeroRank.SR);
	}
	get SSR() {
		return this.skillSets.find((s) => s.rank === HeroRank.SSR);
	}

	constructor(private row: RowWrapper) {
		const name = heroName(row);
		this.fullname = name.fullname;
		this.firstname = name.firstname;
		this.lastname = name.lastname;
		this.englishName = name.englishName;

		let scName =
			characterNameNormalization(
				localizationString("CharacterName", "", "Key", "ChineseSimplified")(this.model)
			) || name.firstname;
		if (this.internalName.endsWith("SP") && !String(scName).endsWith("SP")) {
			scName = `${scName}SP`;
		}
		this.scName = scName;

		let japaneseName = localizationString("CharacterName", "", "Key", "Japanese")(this.model);
		if (japaneseName) {
			japaneseName = japaneseName.replace(/\s?SP/, "(SP)");
		}
		this.japaneseName = japaneseName;

		let koreanName = localizationString("HeroInfo", "", "Key", "Korean")(this.model);
		if (koreanName) {
			koreanName = koreanName.replace(pointRegexp, " ");
			if (name.firstname.indexOf("SP") != -1) {
				koreanName += " SP";
			}
		}
		this.koreanName = koreanName;
	}

	getSkillSet(rankId: number) {
		return this.skillSets.find((ss) => ss.rankId === rankId);
	}

	/**
	 * 取得`{{角色小圖示}}`模板
	 */
	toWiki(options: HeroSmallIconParams = {}) {
		if (!this.enable) {
			if (this.firstname != this.internalName) {
				return tooltipTemplate(this.firstname, this.internalName);
			}
			return this.firstname;
		}
		return heroSmallIconTemplate(this.firstname, {
			text: "true",
			...options,
		});
	}

	/**
	 * 取得`{{角色<noinclude>頁面</noinclude>}}`模板
	 */
	toWikiPage() {
		/**
		 * 2027 冬青少女 h0010s4_a3，skin有改變技能組，在wiki中要特殊處理
		 */
		const hasSkin2027 = !!this.skins.find((skin) => skin.id == "2027");

		return heroPageTemplate({
			角色名稱: this.firstname,
			英文名稱: this.englishName,
			日文名稱: this.japaneseName,
			韓文名稱: this.koreanName,
			角色故事: this.storyChapter?.title ?? "",

			零階: this.N?.name,
			一階: this.R?.name,
			二階: this.SR?.name,
			三階: this.SSR?.name,
			Alt: this.alts.map((alt) => alt.name),
			Skin: this.skins.filter((skin) => skin.id != "2027").map((skin) => skin.name),
			冬青少女: hasSkin2027,

			三階技能強化次數: this.SSR?.skillLevels.length,
		});
	}

	/**
	 * 取得`{{角色數值}}`模板
	 */
	toWikiBase() {
		return heroBaseTemplate(this.atk, this.hp);
	}

	/**
	 * Sdorica Inspector Playground專用
	 */
	getSIKey() {
		return `${this.enable ? "Ｖ" : "　"} ${this.firstname}${
			this.internalName != this.firstname ? ` - (${this.internalName})` : ""
		}`;
	}

	/**
	 * Sdorica Inspector Playground專用
	 */
	toSIJson() {
		const validSkillsets = this.skillSetWithLevels.filter((s) => s.name);
		if (!validSkillsets.length) return;

		const ranks = validSkillsets.reduce<Record<string, string>>((p, s) => {
			p[`(${s.rankPlus})${s.name}`] = HeroSkillSet.toWikiPage(s);
			return p;
		}, {});
		return {
			...this.toJSON(),
			hero: this.toWikiPage(),
			base: this.toWikiBase(),
			ranks: ranks,
		};
	}

	toJSON(minify?: boolean) {
		if (minify) {
			return {
				id: this.id,
				model: this.model,
				fullname: this.fullname,
				name: this.firstname,
				atk: this.atk,
				hp: this.hp,
				slot: this.slot,
				initRank: this.initRank,
			};
		}
		return {
			id: this.id,
			model: this.model,
			slot: this.slot,
			fullname: this.fullname,
			name: this.firstname,
			scName: this.scName,
			enName: this.englishName,
			initRank: this.initRank,
			atk: this.atk,
			hp: this.hp,
			revive: this.revive,
			gender: this.gender,
			series: this.series,
			enable: this.enable,
			skillSets: this.skillSetWithLevels.map((skillset) => skillset.toJSON(true)),
		};
	}
}
