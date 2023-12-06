import { AssetbundleLookupTable } from "../assetbundle-lookup-table";
import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { wikiTitleEscape } from "../wiki-utils";
import { Battlefield } from "./battlefield";
import { ChapterCount } from "./chapter-count";
import { chapterTitleRename } from "./config/chapter";
import { DropItemsGroup } from "./drop-items";
import { ChapterCategory } from "./enums/chapter-category.enum";
import { ChapterGroup } from "./enums/chapter-group.enum";
import { ChapterMainImageType } from "./enums/chapter-main-image-type.enum";
import { TimeDisplayType } from "./enums/chapter-time-display-type.enum";
import { TitleViewType } from "./enums/chapter-title-view-type.enum";
import { ChapterWikiGroup } from "./enums/chapter-wiki-group.enum";
import { ItemPayType } from "./enums/item-pay-type.enum";
import { LookupTableCategory } from "./enums/lookup-table-category.enum";
import { RewardGroupType } from "./enums/reward-group-type.enum";
import { StateCondition, stateConditionText } from "./enums/state-condition.enum";
import { VolumeEnum } from "./enums/volume.enum";
import { Hero } from "./hero";
import { Item } from "./item";
import { ItemPayRef } from "./item-pay-ref";
import { Quest } from "./quest";
import { Volume } from "./volume";

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const DiligentGroupsTable = ImperiumData.fromGamedata().getTable("DiligentGroups");

const instances: Record<string, Chapter> = {};
let allInstances: Chapter[] | null = null;

export class Chapter {
	public static get(id: string): Chapter | undefined;
	public static get(row: RowWrapper): Chapter;
	public static get(rowOrId: RowWrapper | string): Chapter {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? ChaptersTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new Chapter(row);
			}
		}
		return instances[id];
	}

	public static getByVolume(volume: Volume | VolumeEnum): Chapter[] {
		const volumeEnum = volume instanceof Volume ? volume.volume : volume;
		const rows = ChaptersTable.filter((r) => r.get("volume") == volumeEnum);
		const chapters = rows.map((row) => Chapter.get(row));
		return chapters;
	}

	public static getByGroup(group: ChapterGroup): Chapter[] {
		const rows = ChaptersTable.filter((r) => r.get("group") == group);
		const chapters = rows.map((row) => Chapter.get(row));
		return chapters;
	}

	public static getByRewardGroupId(rewardGroupId: string): Chapter[] {
		const rows = ChaptersTable.filter((r) => r.get("rewardGroupId") == rewardGroupId);
		const chapters = rows.map((row) => Chapter.get(row));
		return chapters;
	}

	public static getByBattlefieldId(battlefieldId: string): Chapter[] {
		const rows = ChaptersTable.filter((r) => r.get("battlefieldId") == battlefieldId);
		const chapters = rows.map((row) => Chapter.get(row));
		return chapters;
	}

	public static find(predicate: (value: Chapter) => boolean): Chapter | undefined {
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
		for (let i = 0; i < ChaptersTable.length; i++) {
			const row = ChaptersTable.get(i);
			yield Chapter.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}
	get isLock(): boolean {
		return !!this.row.get("isLock");
	}

	#volume: Volume | undefined | null = null;
	get volume(): Volume | undefined {
		if (this.#volume === null) {
			this.#volume ??= Volume.get(this.row.get("volume"));
		}
		return this.#volume;
	}
	/**
	 * @deprecated 改用 {@link volume}
	 */
	get category(): ChapterCategory {
		return this.row.get("category");
	}
	get group(): ChapterGroup {
		return this.row.get("group");
	}
	get order(): number {
		return +this.row.get("order");
	}
	get mainImage(): string {
		return this.row.get("mainImage") + "";
	}
	get mainImageType(): ChapterMainImageType {
		return this.row.get("mainImageType");
	}
	get mainImageIcons(): string {
		return this.row.get("mainImageIcons");
	}
	get region(): number {
		return +this.row.get("region");
	}

	name: string;
	get nameKey(): string {
		return this.row.get("name") + "";
	}
	title: string;
	get titleKey(): string {
		return this.row.get("title") + "";
	}

	get titleIsHide(): boolean {
		return !!this.row.get("titleIsHide");
	}
	get titleViewType(): TitleViewType {
		return this.row.get("titleViewType");
	}

	get visibleCondition(): StateCondition {
		return this.row.get("visibleCondition");
	}
	get visibleConditionParam(): string {
		return this.row.get("param1");
	}
	visibleConditionText: string;
	get unlockCondition(): StateCondition {
		return this.row.get("unlockCondition");
	}
	get unlockConditionParam(): string {
		return this.row.get("param2");
	}
	unlockConditionText: string;
	unlockText: string;

	get timeDisplay(): TimeDisplayType {
		return this.row.get("timeDisplay");
	}
	get weekday(): number {
		return +this.row.get("weekday");
	}
	get isShowCountdown(): boolean {
		return !!this.row.get("isShowCountdown");
	}
	get dummyQuestCount(): number {
		return +this.row.get("dummyQuestCount");
	}

	/**
	 * @deprecated 改用 {@link chapterCount}
	 */
	get countDisplay(): boolean {
		return !!this.row.get("countDisplay");
	}
	/**
	 * @deprecated 改用 {@link chapterCount}.regainValue
	 */
	get dailyCount(): number {
		return +this.row.get("dailyCount");
	}
	/**
	 * @deprecated 改用 {@link chapterCount}.payItem
	 */
	extraCountItem: ItemPayRef[];

	#chapterCount: ChapterCount | undefined | null = null;
	/**
	 * 章節可用次數
	 */
	get chapterCount(): ChapterCount | undefined {
		if (this.#chapterCount === null) {
			this.#chapterCount ??= ChapterCount.get(this.row.get("chapterCountId"));
		}
		return this.#chapterCount;
	}

	/**
	 * 累積道具獎勵
	 *
	 * 對應 `RewardGroups` 表
	 */
	get rewardGroupId(): string {
		const rewardGroupId = this.row.get("rewardGroupId");
		return rewardGroupId != "-1" ? rewardGroupId : "";
	}
	get rewardGroupType(): RewardGroupType {
		return this.row.get("rewardGroupType");
	}

	/**
	 * 章節完成進度
	 */
	get progress(): boolean {
		return !!this.row.get("progress");
	}

	#dropGroup: DropItemsGroup | undefined | null = null;
	/**
	 * 章節完成獎勵
	 */
	get dropGroup(): DropItemsGroup | undefined {
		if (this.#dropGroup === null) {
			this.#dropGroup = DropItemsGroup.get(+this.row.get("dropGroupID"));
		}
		return this.#dropGroup;
	}

	#battlefield: Battlefield | undefined | null = null;
	/**
	 * 戰場
	 */
	get battlefield(): Battlefield | undefined {
		if (this.#battlefield === null) {
			this.#battlefield ??= Battlefield.get(this.row.get("battlefieldId"));
		}
		return this.#battlefield;
	}

	/**
	 * 是否啟用閱歷值
	 *
	 * 啟用代表可在 `DiligentGroups` Table 找到本章節
	 */
	get isDiligentEnable(): boolean {
		return !!this.row.get("isDiligentEnable");
	}
	#diligentItem: Item | undefined | null = null;
	get diligentItem(): Item | undefined {
		if (this.#diligentItem === null) {
			const row = DiligentGroupsTable.find((r) => r.get("chapterId") == this.id);
			if (row) {
				const diligentId = row.get("diligentId") || "1011";
				this.#diligentItem = Item.get(diligentId);
			} else {
				this.#diligentItem = undefined;
			}
		}
		return this.#diligentItem;
	}

	#quests: Quest[] | null = null;
	get quests(): Quest[] {
		return (this.#quests ??= Quest.getByChapter(this));
	}

	#sideStoryHero: Hero | undefined | null = null;
	get sideStoryHero(): Hero | undefined {
		if (
			![ChapterWikiGroup.SideStory, ChapterWikiGroup.SideStoryEvent].includes(
				this.getWikiGroup()
			)
		) {
			return undefined;
		}
		if (this.#sideStoryHero === null) {
			this.#sideStoryHero = Hero.getBySideStory(this);
		}
		return this.#sideStoryHero;
	}

	constructor(private row: RowWrapper) {
		this.name = localizationString("RegionName")(row.get("name")) || row.get("name");
		this.title = localizationString("RegionName")(row.get("title")) || row.get("title");
		this.unlockText = localizationString("LockMessage")(row.get("unlockText"));

		this.visibleConditionText = stateConditionText(
			this.visibleCondition,
			this.visibleConditionParam
		);
		this.unlockConditionText = stateConditionText(
			this.unlockCondition,
			this.unlockConditionParam
		);

		this.extraCountItem = [];
		if (row.get("extraCountItem"))
			this.extraCountItem.push(
				new ItemPayRef(
					ItemPayType.Item,
					row.get("extraCountItem"),
					row.get("extraCountItemCount")
				)
			);
		if (row.get("extraCountCurrency"))
			this.extraCountItem.push(
				new ItemPayRef(row.get("extraCountCurrency"), "", row.get("extraCountPrice"))
			);
	}

	public getMainImageAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.MainPageImage,
			this.mainImage
		);
	}

	public getMainImageIconsAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.BattleField_SD,
			this.mainImageIcons
		);
	}

	#wikiGroup: ChapterWikiGroup | null = null;
	public getWikiGroup(): ChapterWikiGroup {
		return (this.#wikiGroup ??= this._getWikiGroup());
	}

	private _getWikiGroup(): ChapterWikiGroup {
		switch (this.volume?.volume) {
			case VolumeEnum.Main:
				if (this.mainImage.startsWith("ch")) {
					return ChapterWikiGroup.SdoricaSunset;
				}
				if (this.mainImage.startsWith("S2_")) {
					return ChapterWikiGroup.SdoricaMirage;
				}
				if (this.mainImage.startsWith("S3_")) {
					return ChapterWikiGroup.SdoricaEclipse;
				}
				if (this.mainImage.startsWith("S4_")) {
					return ChapterWikiGroup.SdoricaAurora;
				}
				return ChapterWikiGroup.SdoricaOtherMain;

			case VolumeEnum.Region:
				return ChapterWikiGroup.Region;
			case VolumeEnum.Challenge:
				return ChapterWikiGroup.Challenge;
			case VolumeEnum.Tutorial:
				return ChapterWikiGroup.Tutorial;
			case VolumeEnum.Explore:
				return ChapterWikiGroup.Explore;
			case VolumeEnum.SideStory:
				return ChapterWikiGroup.SideStory;
			case VolumeEnum.Battlefield:
				return ChapterWikiGroup.Battlefield;

			case VolumeEnum.Event:
				switch (this.group) {
					case ChapterGroup.Adventure:
						return ChapterWikiGroup.Adventure;
					case ChapterGroup.Multiplayer:
						return ChapterWikiGroup.Multiplayer;
					case ChapterGroup.SideStory:
						return ChapterWikiGroup.SideStoryEvent;
				}
				if (this.mainImage.startsWith("week")) {
					return ChapterWikiGroup.Week;
				}
				if (this.mainImage.startsWith("bg_equip")) {
					return ChapterWikiGroup.Workshop;
				}
				if (this.mainImage === "daily01") {
					return ChapterWikiGroup.Mineral;
				}
				if (this.mainImage === "daily02") {
					return ChapterWikiGroup.Team;
				}
				if (Chapter.getByVolume(VolumeEnum.SideStory).find((c) => c.title == this.title)) {
					return ChapterWikiGroup.SideStoryEvent;
				}
				if (this.quests.find((q) => q.levelId.match(/char_(.*)_u01/))) {
					return ChapterWikiGroup.SideStoryEvent;
				}
				return ChapterWikiGroup.Event;
		}
		return ChapterWikiGroup.Test;
	}

	public getWikiName() {
		switch (this.getWikiGroup()) {
			case ChapterWikiGroup.SdoricaMirage:
				return wikiTitleEscape(`S2 ${this.name}`);
			case ChapterWikiGroup.SdoricaEclipse:
				return wikiTitleEscape(`S3 ${this.name}`);
			case ChapterWikiGroup.SdoricaAurora:
				return wikiTitleEscape(`S4 ${this.name}`);
		}
		return wikiTitleEscape(this.name);
	}

	public getWikiTitle(): string {
		if (chapterTitleRename[this.id]) {
			return chapterTitleRename[this.id];
		}
		switch (this.getWikiGroup()) {
			case ChapterWikiGroup.SideStoryEvent:
				const ssChapter = Chapter.getByVolume(VolumeEnum.SideStory).find(
					(c) => c.title == this.title
				);
				if (ssChapter) {
					return ssChapter.getWikiTitle();
				}
				const questCharU01 = this.quests.find((q) => q.levelId.match(/char_(.*)_u01/));
				if (questCharU01) {
					const heroName = questCharU01.title.replace("的旅程初級", "");
					return wikiTitleEscape(`${heroName}《${this.title}》`);
				}
				break;
			case ChapterWikiGroup.SideStory:
				if (this.sideStoryHero) {
					return wikiTitleEscape(`${this.sideStoryHero.firstname}《${this.title}》`);
				}
				break;
			case ChapterWikiGroup.Battlefield:
				const quest = this.quests[0];
				if (quest) {
					return wikiTitleEscape(`${this.title}：${quest.title}`);
				}
				break;
		}
		return wikiTitleEscape(this.title);
	}

	public getWikiFullName() {
		return `${this.getWikiName()}：${this.getWikiTitle()}`;
	}

	public getWikiImageName() {
		if (this.volume?.volume == VolumeEnum.Main) {
			return this.getWikiName().replace(/(S\d)?\s?Chapter (\d+)/, "$1第$2章");
		}
		return this.getWikiTitle();
	}
}
