import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { DropItemsGroup } from "./drop-items";
import { HeroRank } from "./enums/hero-rank.enum";
import { HeroSlot } from "./enums/hero-slot.enum";
import { Hero } from "./hero";
import { ItemGiveList } from "./item-give-list";
import { ItemPayRef } from "./item-pay-ref";
import { TavernMissionRequire } from "./tavern-mission-require";

const TavernMissionTable = ImperiumData.fromGamedata().getTable("TavernMission");

const instances: Record<string, TavernMission> = {};
let allInstances: TavernMission[] | null = null;

export class TavernMission {
	public static get(row: RowWrapper): TavernMission;
	public static get(id: string): TavernMission | undefined;
	public static get(rowOrId: RowWrapper | string): TavernMission {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? TavernMissionTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new TavernMission(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: TavernMission) => boolean): TavernMission | undefined {
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
		for (let i = 0; i < TavernMissionTable.length; i++) {
			const row = TavernMissionTable.get(i);
			yield TavernMission.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}
	get tab(): string {
		return this.row.get("tab");
	}
	get category(): string {
		return this.row.get("category");
	}

	name: string;
	get nameWithRank(): string {
		return `【${this.questRankStar}】${this.name}`;
	}
	get iconKey(): string {
		return this.row.get("iconKey");
	}

	/**
	 * 內部註記 (不要用)
	 * @deprecated
	 */
	get internalName(): string {
		return this.row.get("questKeyDescription");
	}

	/**
	 * 階級
	 */
	get questRank(): number {
		return +this.row.get("questRank");
	}
	get questRankStar(): string {
		return `${this.questRank} ★`;
	}

	/**
	 * 所需時間，單位分鐘
	 */
	get time(): number {
		return +this.row.get("time");
	}
	/**
	 * 消耗體力
	 */
	get stamina(): number {
		return +this.row.get("stamina");
	}

	get baseSuccessRate(): number {
		return +this.row.get("baseSuccessRate");
	}
	/**
	 * 出場野獸數量
	 */
	get spaceNum(): number {
		return +this.row.get("spaceNum");
	}

	// 任務英雄限制
	/**
	 * 限制英雄
	 */
	#hero: Hero | undefined | null = null;
	get hero(): Hero | undefined {
		const heroid: string = this.row.get("heroid");
		if (!heroid) {
			return undefined;
		}
		if (this.#hero === null) {
			this.#hero = Hero.get(heroid);
		}
		return this.#hero;
	}
	/**
	 * 限制英雄等級
	 */
	get heroLv(): number {
		return +this.row.get("heroLv");
	}
	/**
	 * 限制英雄階級
	 */
	get heroRank(): HeroRank {
		return this.getHeroRank();
	}
	get heroRankN(): number {
		return +this.row.get("heroRank");
	}
	/**
	 * 限制英雄站位
	 */
	get heroSlot(): HeroSlot[] {
		return this.getHeroSlot();
	}

	/**
	 * 環境
	 */
	get environment(): string {
		return this.row.get("environment");
	}

	#dropItem: DropItemsGroup | undefined | null = null;
	get dropItem(): DropItemsGroup | undefined {
		if (this.#dropItem === null) {
			this.#dropItem = DropItemsGroup.get(+this.row.get("dropItem"));
		}
		return this.#dropItem;
	}

	#extraDropItem: DropItemsGroup | undefined | null = null;
	get extraDropItem(): DropItemsGroup | undefined {
		if (this.#extraDropItem === null) {
			this.#extraDropItem = DropItemsGroup.get(+this.row.get("extraDropItem"));
		}
		return this.#extraDropItem;
	}

	#displayDropItem: ItemGiveList | null = null;
	get displayDropItem(): ItemGiveList {
		return (this.#displayDropItem ??= ItemGiveList.parseList(this.row.get("displayDropItem")));
	}

	#displayExtraDropItem: ItemGiveList | null = null;
	get displayExtraDropItem(): ItemGiveList {
		return (this.#displayExtraDropItem ??= ItemGiveList.parseList(
			this.row.get("displayExtraDropItem")
		));
	}

	get homeExp(): number {
		return +this.row.get("homeExp");
	}
	get monsterExp(): number {
		return +this.row.get("monsterExp");
	}

	/**
	 * 羈絆等級
	 */
	get monsterLv(): number {
		return +this.row.get("monsterLv");
	}
	get monsterLvPenaltyRatio(): number {
		return +this.row.get("monsterLvPenaltyRatio");
	}
	get monsterLvPenaltyMax(): number {
		return +this.row.get("monsterLvPenaltyMax");
	}

	#express: ItemPayRef | undefined | null = null;
	/**
	 * 快速跳過
	 */
	get express(): ItemPayRef | undefined {
		const expressCurrency = this.row.get("expressCurrency");
		const expressConversion = +this.row.get("expressConversion");
		if (expressCurrency == "" || expressCurrency == "-1" || expressConversion < 0) {
			return undefined;
		}
		if (this.#express === null) {
			this.#express = new ItemPayRef(expressCurrency, "", expressConversion);
		}
		return this.#express;
	}

	#reqSkills: TavernMissionRequire[] | null = null;
	/**
	 * 所需技能
	 */
	get reqSkills(): TavernMissionRequire[] {
		return (this.#reqSkills ??= TavernMissionRequire.get(this.id));
	}

	constructor(private row: RowWrapper) {
		const questKeyName = row.get("questKeyName");
		this.name =
			localizationString("TavernMission")(questKeyName) ||
			row.get("questKeyDescription") ||
			questKeyName;
	}

	private getHeroRank() {
		switch (this.heroRankN) {
			case 2:
				return HeroRank.N;
			case 3:
				return HeroRank.R;
			case 4:
				return HeroRank.SR;
			case 5:
				return HeroRank.SSR;
		}
		return HeroRank.Unknown;
	}

	private getHeroSlot() {
		const slots = [
			!!this.row.get("gold") ? HeroSlot.GOLD : null,
			!!this.row.get("black") ? HeroSlot.BLACK : null,
			!!this.row.get("white") ? HeroSlot.WHITE : null,
		];
		if (slots.every((slot) => slot)) {
			// 都為真代表沒限制
			return [];
		}
		return slots.filter(Boolean) as HeroSlot[];
	}

	public getTimeString() {
		let time = this.time;
		let str = ``;
		if (time >= 60) {
			str += `${Math.floor(time / 60)}小時`;
			time %= 60;
		}
		if (time > 0) {
			str += `${time}分鐘`;
		}
		return str;
	}

	public getWikiCategoryName() {
		if (this.name.indexOf("田野調查") != -1) {
			return "田野調查";
		}
		if (this.name.indexOf("營地巡邏") != -1) {
			return "營地巡邏";
		}
		if (this.name.indexOf("材料收集") != -1) {
			return "材料收集";
		}
		if (this.name.indexOf("戰鬥訓練") != -1) {
			return "戰鬥訓練";
		}
		if (this.name.indexOf("糧食儲備") != -1) {
			return "糧食儲備";
		}
		if (this.name.indexOf("祕境尋寶") != -1) {
			return "祕境尋寶";
		}
		if (this.name.indexOf("秘境") != -1) {
			return "秘境";
		}
		if (this.name.indexOf("區域探勘") != -1) {
			return "區域探勘";
		}
		if (this.name.indexOf("擴建計畫") != -1) {
			return "發展";
		}
		if (this.name.indexOf("精進計畫") != -1) {
			return "發展";
		}
		return this.name.replace(/【[^】]*】/, "");
	}
}
