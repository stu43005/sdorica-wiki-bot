import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { wikiTitleEscape } from '../wiki-utils';
import { chapterTitleRename } from './config/chapter';
import { ChapterCategory } from "./enums/chapter-category.enum";
import { ChapterGroup } from "./enums/chapter-group.enum";
import { TimeDisplayType } from "./enums/chapter-time-display-type.enum";
import { TitleViewType } from "./enums/chapter-title-view-type.enum";
import { ChapterWikiGroup } from './enums/chapter-wiki-group.enum';
import { ItemPayType } from './enums/item-pay-type.enum';
import { StateCondition } from "./enums/state-condition.enum";
import { VolumeEnum } from './enums/volume.enum';
import { Hero } from "./hero";
import { ItemPayRef } from './item-pay-ref';
import { Volume } from "./volume";

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");

const instances: Record<string, Chapter> = {};
let allInstances: Chapter[] | null = null;

export class Chapter {
	public static get(row: RowWrapper): Chapter;
	public static get(id: string): Chapter | undefined;
	public static get(rowOrId: RowWrapper | string): Chapter {
		const id = typeof rowOrId === 'string' ? rowOrId : rowOrId.get('id');
		if (!instances[id]) {
			const row = typeof rowOrId === 'string' ? ChaptersTable.find(r => r.get('id') == id) : rowOrId;
			if (row) {
				instances[id] = new Chapter(row);
			}
		}
		return instances[id];
	}

	public static getByVolume(volume: Volume | VolumeEnum): Chapter[] {
		const volumeEnum = volume instanceof Volume ? volume.volume : volume;
		const rows = ChaptersTable.filter(r => r.get("volume") == volumeEnum);
		const chapters = rows.map(row => Chapter.get(row));
		return chapters;
	}

	public static getByRewardGroupId(rewardGroupId: string): Chapter[] {
		const rows = ChaptersTable.filter(r => r.get("rewardGroupId") == rewardGroupId);
		const chapters = rows.map(row => Chapter.get(row));
		return chapters;
	}

	public static find(predicate: (value: Chapter, index: number) => boolean): Chapter | undefined {
		const item = ChaptersTable.find((row, index) => {
			const item2 = Chapter.get(row);
			return predicate(item2, index);
		});
		return item && Chapter.get(item);
	}

	public static getAll() {
		return allInstances ?? (allInstances = Array.from(this.getAllGenerator()));
	}

	public static *getAllGenerator() {
		for (let i = 0; i < ChaptersTable.length; i++) {
			const row = ChaptersTable.get(i);
			yield Chapter.get(row);
		}
	}

	get id(): string { return this.row.get('id'); }
	get enable(): boolean { return !!this.row.get('enable'); }
	get isLock(): boolean { return !!this.row.get('isLock'); }

	#volume: Volume | null = null;
	get volume(): Volume {
		return this.#volume ?? (this.#volume = Volume.get(this.row.get('volume')));
	}
	/**
	 * @deprecated 改用 volume
	 */
	get category(): ChapterCategory { return this.row.get('category'); }
	get group(): ChapterGroup { return this.row.get('group'); }
	get order(): number { return +this.row.get('order'); }
	get mainImage(): string { return this.row.get('mainImage'); }
	get region(): number { return +this.row.get('region'); }

	name: string;
	title: string;

	#wikiGroup: ChapterWikiGroup | null = null;
	get wikiGroup(): ChapterWikiGroup {
		return this.#wikiGroup ?? (this.#wikiGroup = this.getWikiGroup());
	}

	get titleIsHide(): boolean { return !!this.row.get('titleIsHide'); }
	get titleViewType(): TitleViewType { return this.row.get('titleViewType'); }

	get visibleCondition(): StateCondition { return this.row.get('visibleCondition'); }
	get visibleConditionParam(): string { return this.row.get('param1'); }
	get unlockCondition(): StateCondition { return this.row.get('unlockCondition'); }
	get unlockConditionParam(): string { return this.row.get('param2'); }
	unlockText: string;

	get timeDisplay(): TimeDisplayType { return this.row.get('timeDisplay'); }
	get weekday(): number { return +this.row.get('weekday'); }
	get isShowCountdown(): boolean { return !!this.row.get('isShowCountdown'); }

	get countDisplay(): boolean { return !!this.row.get('countDisplay'); }
	get dailyCount(): number { return +this.row.get('dailyCount'); }
	extraCountItem: ItemPayRef[];
	// TODO: chapterCountId

	/**
	 * 活動累積道具獎勵
	 *
	 * 對應 RewardGroups Table
	 */
	get rewardGroupId(): string { return this.row.get('rewardGroupId'); }

	/**
	 * 章節完成進度
	 */
	get progress(): boolean { return !!this.row.get('progress'); }

	/**
	 * 章節完成獎勵
	 *
	 * 對應 DropItems Table
	 */
	get dropGroupID(): number { return +this.row.get('dropGroupID'); }

	constructor(private row: RowWrapper) {
		this.name = localizationString("RegionName")(row.get('name'));
		this.title = localizationString("RegionName")(row.get('title'));
		this.unlockText = localizationString("LockMessage")(row.get('unlockText'));

		this.extraCountItem = [];
		if (row.get('extraCountItem')) this.extraCountItem.push(new ItemPayRef(ItemPayType.Item, row.get('extraCountItem'), row.get('extraCountItemCount')));
		if (row.get('extraCountCurrency')) this.extraCountItem.push(new ItemPayRef(row.get('extraCountCurrency'), '', row.get('extraCountPrice')));
	}

	private getWikiGroup(): ChapterWikiGroup {
		switch (this.volume.volume) {
			case VolumeEnum.Main:
				if (this.mainImage.startsWith('ch')) {
					return ChapterWikiGroup.SdoricaSunset;
				}
				if (this.mainImage.startsWith('S2_')) {
					return ChapterWikiGroup.SdoricaMirage;
				}
				if (this.mainImage.startsWith('S3_')) {
					return ChapterWikiGroup.SdoricaEclipse;
				}
				return ChapterWikiGroup.SdoricaOtherMain;

			case VolumeEnum.Region: return ChapterWikiGroup.Region;
			case VolumeEnum.Challenge: return ChapterWikiGroup.Challenge;
			case VolumeEnum.Tutorial: return ChapterWikiGroup.Tutorial;
			case VolumeEnum.Explore: return ChapterWikiGroup.Explore;
			case VolumeEnum.SideStory: return ChapterWikiGroup.SideStory;

			case VolumeEnum.Event:
				switch (this.group) {
					case ChapterGroup.Adventure: return ChapterWikiGroup.Adventure;
					case ChapterGroup.Multiplayer: return ChapterWikiGroup.Multiplayer;
					case ChapterGroup.SideStory: return ChapterWikiGroup.SideStory;
				}
				if (this.mainImage.startsWith('week')) {
					return ChapterWikiGroup.Week;
				}
				if (this.mainImage === 'daily01') {
					return ChapterWikiGroup.Mineral;
				}
				if (this.mainImage === 'daily02') {
					return ChapterWikiGroup.Team;
				}
				if (Chapter.find(c => c.volume.volume == VolumeEnum.SideStory && c.title == this.title)) {
					return ChapterWikiGroup.SideStory;
				}
				if (QuestsTable.find(r => r.get("chapter") == this.id && !!(r.get("levelId") + "").match(/char_(.*)_u01/))) { // TODO:
					return ChapterWikiGroup.SideStory;
				}
				return ChapterWikiGroup.Event;

			case VolumeEnum.Test: return ChapterWikiGroup.Test;
		}
	}

	getWikiName() {
		switch (this.wikiGroup) {
			case ChapterWikiGroup.SdoricaMirage:
				return wikiTitleEscape(`S2 ${this.name}`);
			case ChapterWikiGroup.SdoricaEclipse:
				return wikiTitleEscape(`S3 ${this.name}`);
		}
		return wikiTitleEscape(this.name);
	}

	getWikiTitle() {
		if (chapterTitleRename[this.id]) {
			return chapterTitleRename[this.id];
		}
		if (this.wikiGroup == ChapterWikiGroup.SideStory) {
			if (this.volume.volume == VolumeEnum.Event) {
				const ssChapter = Chapter.find(c => c.volume.volume == VolumeEnum.SideStory && c.title == this.title);
				if (ssChapter) {
					return ssChapter.getWikiTitle();
				}
				const questCharU01 = QuestsTable.find(r => r.get("chapter") == this.id && !!(r.get("levelId") + "").match(/char_(.*)_u01/)); // TODO:
				if (questCharU01) {
					const questCharU01Name = localizationString("QuestName")(questCharU01.get("levelId"));
					const heroName = questCharU01Name.replace("的旅程初級", "");
					return wikiTitleEscape(`${heroName}《${this.title}》`);
				}
			}
			const ssHero = Hero.getBySideStory(this.id);
			if (ssHero) {
				return wikiTitleEscape(`${ssHero.firstname}《${this.title}》`);
			}
		}
		return wikiTitleEscape(this.title);
	}

	getWikiImageName() {
		if (this.volume.volume == VolumeEnum.Main) {
			return this.getWikiName().replace(/(S\d)?\s?Chapter (\d+)/, '$1第$2章');
		}
		return this.getWikiTitle();
	}

}
