import { AssetbundleLookupTable } from "../assetbundle/assetbundle-lookup-table.js";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationStringAuto } from "../localization.js";
import { LookupTableCategory } from "./enums/custom/lookup-table-category.enum.js";
import { QuestModeBonusType } from "./enums/quest-mode-bonus-type.enum.js";

const QuestModeTable = ImperiumData.fromGamedata().getTable("QuestMode");

const instances: Record<string, QuestMode> = {};
let allInstances: QuestMode[] | null = null;

export class QuestMode {
	public static get(id: string): QuestMode | undefined;
	public static get(row: RowWrapper): QuestMode;
	public static get(rowOrId: RowWrapper | string): QuestMode {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? QuestModeTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new QuestMode(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: QuestMode) => boolean): QuestMode | undefined {
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
		for (let i = 0; i < QuestModeTable.length; i++) {
			const row = QuestModeTable.get(i);
			yield QuestMode.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}

	name: string;

	get modeImage(): string {
		return this.row.get("modeImage");
	}
	get popupModeImage(): string {
		return this.row.get("popupModeImage");
	}

	get order(): number {
		return +this.row.get("order");
	}

	get levelAdjust(): number {
		return +this.row.get("levelAdjust");
	}

	get bonusType(): QuestModeBonusType {
		return this.row.get("bonusType");
	}
	get trialBonus(): number {
		return +this.row.get("trialBonus");
	}

	constructor(private row: RowWrapper) {
		this.name = localizationStringAuto()(row.get("modeI2")).trim();
	}

	getModeImageAssetUrl() {
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.TierMedalSprite,
			this.modeImage,
		);
	}

	getBonusSymbol() {
		switch (this.bonusType) {
			case QuestModeBonusType.Add:
				return "+";
			case QuestModeBonusType.Multiply:
				return "*";
		}
	}

	toString() {
		return `${this.name}(Lv+${this.levelAdjust}, Bonus:${this.getBonusSymbol()}${
			this.trialBonus
		})`;
	}
}
