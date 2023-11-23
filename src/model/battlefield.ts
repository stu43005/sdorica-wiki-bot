import { ImperiumData, RowWrapper } from "../imperium-data";
import { Chapter } from "./chapter";
import { Item } from "./item";

// `Raids`是舊版本，現已拆分為 `Battlefields`及`RaidChapterSettings`
// const RaidsTable = ImperiumData.fromGamedata().getTable("Raids");
const BattlefieldsTable = ImperiumData.fromGamedata().getTable("Battlefields");
const RaidChapterSettingsTable = ImperiumData.fromGamedata().getTable("RaidChapterSettings");
const LoreChapterSettingsTable = ImperiumData.fromGamedata().getTable("LoreChapterSettings");

const instances: Record<string, Battlefield> = {};
let allInstances: Battlefield[] | null = null;

export class Battlefield {
	public static get(row: RowWrapper): Battlefield;
	public static get(id: string): Battlefield | undefined;
	public static get(rowOrId: RowWrapper | string): Battlefield {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? BattlefieldsTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new Battlefield(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: Battlefield) => boolean): Battlefield | undefined {
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
		for (let i = 0; i < BattlefieldsTable.length; i++) {
			const row = BattlefieldsTable.get(i);
			yield Battlefield.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get endTurnCount(): number {
		return +this.row.get("endTurnCount");
	}
	/**
	 * 對應 `BattlefieldDropItems` Table
	 */
	get questLvDropId(): string {
		return this.row.get("questLvDropId");
	}
	get statusInherit(): boolean {
		return !!this.row.get("statusInherit");
	}

	#chapters: Chapter[] | null = null;
	get chapters(): Chapter[] {
		return (this.#chapters ??= Chapter.getByBattlefieldId(this.id));
	}

	// === ChapterSetting 共用 ===

	private get chapterSettings(): RowWrapper | undefined {
		return this.raidChapterSetting ?? this.loreChapterSettings;
	}

	/**
	 * 排名獎勵
	 *
	 * 對應 `BattlefieldRanks` Table
	 */
	get rankGroupId(): string | undefined {
		return this.chapterSettings?.get("rankGroupId");
	}

	#targetItem: Item | undefined | null = null;
	/**
	 * 排名蒐集品
	 */
	get targetItem(): Item | undefined {
		if (!this.chapterSettings) {
			return undefined;
		}
		if (this.#targetItem === null) {
			this.#targetItem = Item.get(this.chapterSettings.get("targetItemId"));
		}
		return this.#targetItem;
	}

	// === RaidChapterSetting ===

	private raidChapterSetting: RowWrapper | undefined;

	get rankReward(): boolean | undefined {
		return this.raidChapterSetting && !!this.raidChapterSetting.get("rankReward");
	}

	// === LoreChapterSetting ===

	private loreChapterSettings: RowWrapper | undefined;

	get bossIconId(): string | undefined {
		return this.loreChapterSettings?.get("bossIconId");
	}
	/**
	 * 評價成就
	 *
	 * 對應 `EvaluateAchievements` Table
	 */
	get evaluateAchievementGroupId(): string | undefined {
		return this.loreChapterSettings?.get("evaluateAchievementGroupId");
	}
	/**
	 * 戰鬥評價
	 *
	 * 對應 `Evaluates` Table
	 */
	get evaluateGroupId(): string | undefined {
		return this.loreChapterSettings?.get("evaluateGroupId");
	}
	// get evaluateId(): string | undefined { return this.loreChapterSettings?.get('evaluateId'); }
	/**
	 * 積分獎勵
	 *
	 * 對應 `AdventureWeekPoint` Table
	 */
	get pointGroupId(): string | undefined {
		return this.loreChapterSettings?.get("pointGroupId");
	}

	constructor(private row: RowWrapper) {
		this.raidChapterSetting = RaidChapterSettingsTable.find((r) => r.get("id") == this.id);
		this.loreChapterSettings = LoreChapterSettingsTable.find((r) => r.get("id") == this.id);
	}
}
