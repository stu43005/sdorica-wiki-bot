import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString, localizationStringAuto } from "../localization";
import { wikiTitleEscape } from "../wiki-utils";
import { Chapter } from "./chapter";
import { questWikiLinkRename } from "./config/quest";
import { DropItemsGroup } from "./drop-items";
import { ChapterWikiGroup } from "./enums/chapter-wiki-group.enum";
import { DropRuleCategory } from "./enums/drop-rule-category.enum";
import { ItemGiveType } from "./enums/item-give-type.enum";
import { ItemGiveList } from "./item-give-list";
import { ItemGiveRef } from "./item-give-ref";
import { QuestExtraSetting } from "./quest-extra-setting";

const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");

const instances: Record<string, Quest> = {};
let allInstances: Quest[] | null = null;

export class Quest {
	public static get(row: RowWrapper): Quest;
	public static get(id: string): Quest | undefined;
	public static get(rowOrId: RowWrapper | string): Quest {
		const id = typeof rowOrId === 'string' ? rowOrId : rowOrId.get('id');
		if (!instances[id]) {
			const row = typeof rowOrId === 'string' ? QuestsTable.find(r => r.get('id') == id) : rowOrId;
			if (row) {
				instances[id] = new Quest(row);
			}
		}
		return instances[id];
	}

	public static getByChapter(chapter: Chapter): Quest[] {
		const rows = QuestsTable.filter(r => r.get("chapter") == chapter.id);
		const chapters = rows.map(row => Quest.get(row)).sort((a, b) => a.order - b.order);
		return chapters;
	}

	public static find(predicate: (value: Quest) => boolean): Quest | undefined {
		for (const item of this.getAllGenerator()) {
			if (predicate(item)) {
				return item;
			}
		}
	}

	public static getAll() {
		return allInstances ??= Array.from(this.getAllGenerator());
	}

	public static *getAllGenerator() {
		for (let i = 0; i < QuestsTable.length; i++) {
			const row = QuestsTable.get(i);
			yield Quest.get(row);
		}
	}

	get id(): string { return this.row.get('id'); }

	get requireQuestId(): string { return this.row.get('requireQuestId'); }
	#requireQuest: Quest | undefined | null = null;
	get requireQuest(): Quest | null {
		if (this.requireQuestId === "-1") {
			return null;
		}
		if (this.#requireQuest === null) {
			this.#requireQuest = Quest.get(this.requireQuestId);
		}
		return this.#requireQuest ?? null;
	}

	get enable(): boolean { return !!this.row.get('enable'); }

	#chapter: Chapter | null = null;
	get chapter(): Chapter {
		return this.#chapter ??= Chapter.get(this.row.get('chapter'));
	}

	get levelId(): string { return this.row.get('levelId'); }

	/**
	 * 關卡名稱
	 */
	title: string;

	/**
	 * 故事/戰鬥/挑戰/...
	 */
	subtitle: string;

	/**
	 * 內部註記 (不要用)
	 * @deprecated
	 */
	get internalName(): string { return this.row.get('name'); }

	questLocation: string;
	get sceneId(): string { return this.row.get('sceneId'); }
	get dynamicLevel(): boolean { return !!this.row.get('dynamicLevel'); }
	get recommendLevel(): number { return +this.row.get('recommendLevel'); }
	get requireLevel(): number { return +this.row.get('requireLevel'); }

	/**
	 * 可用角色限制
	 *
	 * 對應到 `TeamLimits` 表
	 */
	get heroLimitId(): string { return this.row.get('heroLimitId'); }

	#extraSetting: QuestExtraSetting | undefined | null = null;
	get extraSetting(): QuestExtraSetting | undefined {
		if (this.#extraSetting === null) {
			this.#extraSetting = QuestExtraSetting.get(this.row.get('extraSettingId'));
		}
		return this.#extraSetting;
	}

	get dropRule(): DropRuleCategory { return this.row.get('dropRule'); }

	#dropFirst: QuestDrop | null = null;
	get dropFirst(): QuestDrop {
		return this.#dropFirst ??= new QuestDrop(this.row, true);
	}

	#drop: QuestDrop | null = null;
	get drop(): QuestDrop {
		return this.#drop ??= new QuestDrop(this.row, false);
	}

	get rule(): boolean { return !!this.row.get('rule'); }
	ruleInfo: string;

	get clearTeam(): boolean { return !!this.row.get('clearTeam'); }
	get finishIcon(): boolean { return !!this.row.get('finishIcon'); }
	get restart(): boolean { return !!this.row.get('restart'); }
	get waveReset(): boolean { return !!this.row.get('waveReset'); }

	get order(): number { return +this.row.get('order'); }

	constructor(private row: RowWrapper) {
		this.title = localizationString("QuestName")(this.levelId) || this.internalName || this.levelId;
		this.subtitle = localizationString("Metagame")(row.get('subtitle')) || row.get('subtitle');
		this.questLocation = localizationString("POIName")(row.get('questLocation')) || row.get('questLocation');
		this.ruleInfo = localizationString("Metagame")(row.get('ruleInfo')) || row.get('ruleInfo');
	}

	public getWikiLink() {
		if (questWikiLinkRename[this.id]) {
			return questWikiLinkRename[this.id];
		}
		const title = wikiTitleEscape(this.title);
		switch (this.chapter.getWikiGroup()) {
			case ChapterWikiGroup.Multiplayer:
				return `${this.chapter.getWikiTitle()}/${title}${this.recommendLevel === 50 ? "(Lv.50)" : ""}`;
			case ChapterWikiGroup.SideStory:
			case ChapterWikiGroup.SideStoryEvent:
			case ChapterWikiGroup.Event:
				return `${this.chapter.getWikiTitle()}/${title}`;
		}
		return title;
	}

}

export class QuestDrop {
	displayDropText: string;

	#displayDropItem: ItemGiveList | null = null;
	get displayDropItem(): ItemGiveList {
		return this.#displayDropItem ??= ItemGiveList.parseList(this.row.get(this.getKey('displayDropItem')));
	}

	#dropGroup: DropItemsGroup | undefined | null = null;
	get dropGroup(): DropItemsGroup | undefined {
		if (this.#dropGroup === null) {
			this.#dropGroup = DropItemsGroup.get(+this.row.get(this.getKey('dropGroupId')));
		}
		return this.#dropGroup;
	}

	/**
	 * 角色的經驗值
	 */
	get expHero(): number { return +this.row.get(this.getKey('expHero')); }

	#ring: ItemGiveRef | null = null;
	/**
	 * 魂晶碎片
	 */
	get ring(): ItemGiveRef {
		return this.#ring ??= new ItemGiveRef(ItemGiveType.Ring, "", +this.row.get(this.getKey('ring')));
	}

	#expPlayer: ItemGiveRef | null = null;
	/**
	 * 諦視者的經驗值 (諦視者傳承卷軸)
	 */
	get expPlayer(): ItemGiveRef {
		return this.#expPlayer ??= new ItemGiveRef(ItemGiveType.PlayerExp, "", +this.row.get(this.getKey('expPlayer')));
	}

	#coin: ItemGiveRef | null = null;
	/**
	 * 庫倫
	 */
	get coin(): ItemGiveRef {
		return this.#coin ??= new ItemGiveRef(ItemGiveType.Coin, "", +this.row.get(this.getKey('coin')));
	}

	#expTimePiece: ItemGiveRef | null = null;
	/**
	 * 魂能
	 */
	get expTimePiece(): ItemGiveRef {
		return this.#expTimePiece ??= new ItemGiveRef(ItemGiveType.Soul, "", +this.row.get(this.getKey('expTimePiece')));
	}

	constructor(private row: RowWrapper, private first?: boolean) {
		const displayDropTextKey = row.get(this.getKey('displayDropText'));
		this.displayDropText = localizationStringAuto()(displayDropTextKey) || displayDropTextKey;
	}

	private getKey(key: string) {
		return `${key}${this.first ? 'First' : ''}`;
	}
}
