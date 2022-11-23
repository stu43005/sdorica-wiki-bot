import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { DropItemsGroup } from "./drop-items";
import { SweepUnlockType } from "./enums/sweep-unlock-type.enum";
import { Hero } from "./hero";
import { Item } from "./item";
import { ItemGiveList } from "./item-give-list";
import { Quest } from "./quest";
import { TemplateString } from "./template-string";

const QuestExtraSettingsTable = ImperiumData.fromGamedata().getTable("QuestExtraSettings");

const instances: Record<string, QuestExtraSetting> = {};
let allInstances: QuestExtraSetting[] | null = null;

export class QuestExtraSetting {
	public static get(row: RowWrapper): QuestExtraSetting;
	public static get(id: string): QuestExtraSetting | undefined;
	public static get(rowOrId: RowWrapper | string): QuestExtraSetting {
		const id = typeof rowOrId === 'string' ? rowOrId : rowOrId.get('id');
		if (!instances[id]) {
			const row = typeof rowOrId === 'string' ? QuestExtraSettingsTable.find(r => r.get('id') == id) : rowOrId;
			if (row) {
				instances[id] = new QuestExtraSetting(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: QuestExtraSetting) => boolean): QuestExtraSetting | undefined {
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
		for (let i = 0; i < QuestExtraSettingsTable.length; i++) {
			const row = QuestExtraSettingsTable.get(i);
			yield QuestExtraSetting.get(row);
		}
	}

	get id(): string { return this.row.get('id'); }

	/**
	 * 內部註記 (不要用)
	 * @deprecated
	 */
	get internalName(): string { return this.row.get('name'); }

	/**
	 * 戰鬥成就獎勵
	 *
	 * 對應 `QuestAchievements` Table
	 */
	get achievementId(): string { return this.row.get('achievementId'); }

	get dropShow(): boolean { return !!this.row.get('dropShow'); }
	get end(): boolean { return !!this.row.get('end'); }
	get extraMode(): string { return this.row.get('extraMode'); }

	/**
	 * 這是探索關卡
	 */
	get isExploreQuest(): boolean { return !!this.row.get('isExploreQuest'); }

	/**
	 * 對應 `QuestMode` Table
	 */
	get questMode(): string { return this.row.get('questMode'); }

	/**
	 * 幻境計分規則
	 *
	 * 對應 `AdventureRule` Table
	 *
	 * @deprecated 改用 {@link scoreRule}
	 */
	get advRule(): string { return this.row.get('advRule'); }
	/**
	 * 幻境計分規則
	 *
	 * 對應 `ScoreRules` Table
	 */
	get scoreRule(): string { return this.row.get('scoreRule'); }

	/**
	 * 關卡解鎖條件
	 */
	lockMessage: string;
	get unlockType(): string { return this.row.get('unlockType'); }
	get param1(): string { return this.row.get('param1'); }
	get param2(): number { return +this.row.get('param2'); }

	// 掃蕩
	#sweepDisplayDropItem: ItemGiveList | null = null;
	get sweepDisplayDropItem(): ItemGiveList {
		return this.#sweepDisplayDropItem ??= ItemGiveList.parseList(this.row.get('sweepDisplayDropItem'));
	}
	#sweepDropGroupId: DropItemsGroup | undefined | null = null;
	get sweepDropGroupId(): DropItemsGroup | undefined {
		if (this.#sweepDropGroupId === null) {
			this.#sweepDropGroupId = DropItemsGroup.get(+this.row.get('sweepDropGroupId'));
		}
		return this.#sweepDropGroupId;
	}
	/**
	 * 掃蕩解鎖條件
	 */
	sweepUnlockText = "";
	get sweepUnlockType(): SweepUnlockType { return this.row.get('sweepUnlockType'); }
	get sweepUnlockValue(): number { return +this.row.get('sweepUnlockValue'); }

	constructor(private row: RowWrapper) {
		const lockMessage = new TemplateString(localizationString("LockMessage")(this.row.get('lockMessage')));
		switch (this.unlockType) {
			case "playerLevel":
				this.lockMessage = lockMessage.apply({
					level: this.param2,
				});
				break;
			case "QuestComplete": {
				const quest = Quest.get(this.param1);
				this.lockMessage = lockMessage.apply({
					questId: quest?.title ?? this.param1,
				});
				break;
			}
			case "itemTotal": {
				const item = Item.get(this.param1);
				this.lockMessage = lockMessage.apply({
					itemName: item?.name ?? this.param1,
					itemCount: this.param2,
				});
				break;
			}
			case "heroRank": {
				const hero = Hero.get(this.param1);
				this.lockMessage = lockMessage.apply({
					heroName: hero?.firstname ?? this.param1,
				});
				break;
			}
			case "diligent":
				this.lockMessage = lockMessage.apply({
					diligentLevel: this.param2,
				});
				break;
			case "":
				this.lockMessage = "";
				break;
			default:
				this.lockMessage = lockMessage.toString();
				break;
		}

		if (this.sweepUnlockType !== SweepUnlockType.NoSweep) {
			this.sweepUnlockText = new TemplateString(localizationString("Metagame")(`sweep_${this.sweepUnlockType.toLowerCase()}_insufficient`)).apply({
				requireCount: this.sweepUnlockValue,
			});
		}
	}

}
