import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { range } from "../utils.js";
import { PayType } from "./enums/pay-type.enum.js";
import { ExploreBuilding } from "./explore-building.js";
import { ExploreItem } from "./explore-item.js";
import { ItemPayList } from "./item-pay-list.js";
import { ItemPayRef } from "./item-pay-ref.js";

const ExploreCompositeTable = ImperiumData.fromGamedata().getTable("ExploreComposite");

const instances: Record<string, ExploreComposite> = {};
let allInstances: ExploreComposite[] | null = null;

export class ExploreComposite {
	public static get(id: string): ExploreComposite | undefined;
	public static get(row: RowWrapper): ExploreComposite;
	public static get(rowOrId: RowWrapper | string): ExploreComposite {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? ExploreCompositeTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new ExploreComposite(row);
			}
		}
		return instances[id];
	}

	public static getByItem(itemOrId: ExploreItem | string) {
		const itemId = itemOrId instanceof ExploreItem ? itemOrId.id : itemOrId;
		return ExploreComposite.getAll().filter((comp) => comp.item?.id === itemId && comp.enable);
	}

	public static getByBuilding(buildingOrId: ExploreBuilding | string) {
		const buildingId = buildingOrId instanceof ExploreBuilding ? buildingOrId.id : buildingOrId;
		return ExploreComposite.getAll().filter(
			(comp) => comp.requireBuilding?.id === buildingId && comp.enable,
		);
	}

	public static getDisabled() {
		return ExploreComposite.getAll().filter((comp) => !comp.enable);
	}

	public static find(
		predicate: (value: ExploreComposite) => boolean,
	): ExploreComposite | undefined {
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
		for (let i = 0; i < ExploreCompositeTable.length; i++) {
			const row = ExploreCompositeTable.get(i);
			yield ExploreComposite.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}
	get groupId(): string {
		return this.row.get("groupId");
	}

	#requireBuilding: ExploreBuilding | undefined | null = null;
	/**
	 * 要求設施
	 */
	get requireBuilding(): ExploreBuilding | undefined {
		if (this.#requireBuilding === null) {
			this.#requireBuilding = ExploreBuilding.get(this.row.get("requireBuildingId"));
		}
		return this.#requireBuilding;
	}

	/**
	 * 合成條件
	 */
	get requireFlagId(): string {
		return this.row.get("requireFlagId");
	}

	#item: ExploreItem | undefined | null = null;
	get item(): ExploreItem | undefined {
		if (this.#item === null) {
			this.#item = ExploreItem.get(this.row.get("itemId"));
		}
		return this.#item;
	}

	#materials: ItemPayList | null = null;
	/**
	 * 合成素材
	 */
	get materials(): ItemPayList {
		if (this.#materials === null) {
			this.#materials = new ItemPayList(
				range(1, 4)
					.map(
						(i) =>
							new ItemPayRef(
								PayType.ExploreItem,
								this.row.get(`item${i}Id`),
								this.row.get(`item${i}Count`),
							),
					)
					.filter((ref) => !!ref.item),
			);
		}
		return this.#materials;
	}

	get initialViewable(): boolean {
		return !!this.row.get("initialViewable");
	}

	/**
	 * 在 {@link resetDay} 天數內最大合成次數
	 */
	get maxCount(): number {
		return +this.row.get("maxCount");
	}
	get resetDay(): number {
		return +this.row.get("resetDay");
	}

	get requireFlagConditionGroupId(): string {
		return this.row.get("requireFlagConditionGroupId");
	}

	constructor(private row: RowWrapper) {}
}
