import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationExploreBuildingName, localizationString } from "../localization.js";
import { range } from "../utils.js";
import { ExploreBuildingType } from "./enums/explore-building-type.enum.js";
import { PayType } from "./enums/pay-type.enum.js";
import { ExploreComposite } from "./explore-composite.js";
import { ItemPayRef } from "./item-pay-ref.js";

const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");

const instances: Record<string, ExploreBuilding> = {};
let allInstances: ExploreBuilding[] | null = null;

export class ExploreBuilding {
	public static get(id: string): ExploreBuilding | undefined;
	public static get(row: RowWrapper): ExploreBuilding;
	public static get(rowOrId: RowWrapper | string): ExploreBuilding {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? ExploreBuildingTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new ExploreBuilding(row);
			}
		}
		return instances[id];
	}

	public static getByType(type: ExploreBuildingType): ExploreBuilding[] {
		const rows = ExploreBuildingTable.filter((r) => r.get("type") == type);
		const buildings = rows
			.map((row) => ExploreBuilding.get(row))
			.sort((a, b) => a.level - b.level);
		return buildings;
	}

	public static find(
		predicate: (value: ExploreBuilding) => boolean,
	): ExploreBuilding | undefined {
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
		for (let i = 0; i < ExploreBuildingTable.length; i++) {
			const row = ExploreBuildingTable.get(i);
			yield ExploreBuilding.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get type(): ExploreBuildingType {
		return this.row.get("type");
	}
	get level(): number {
		return +this.row.get("level");
	}
	get effectValue(): string {
		return this.row.get("effectValue");
	}
	get iconKey(): string {
		return this.row.get("iconKey");
	}

	name: string;
	description: string;

	get nameLevel(): string {
		return `${this.name} Lv.${this.level}`;
	}

	get storageSize(): number {
		if (this.type === ExploreBuildingType.Warehouse) {
			return +this.effectValue;
		}
		return NaN;
	}

	#levelUpItems: ItemPayRef[] | null = null;
	get levelUpItems(): ItemPayRef[] {
		if (this.#levelUpItems === null) {
			this.#levelUpItems = range(1, 4)
				.map(
					(i) =>
						new ItemPayRef(
							PayType.ExploreItem,
							this.row.get(`item${i}Id`),
							this.row.get(`item${i}Count`),
						),
				)
				.filter((ref) => !!ref.item);
		}
		return this.#levelUpItems;
	}

	#levelUpBuilding: ExploreBuilding | undefined | null = null;
	get levelUpBuilding(): ExploreBuilding | undefined {
		if (this.#levelUpBuilding === null) {
			this.#levelUpBuilding = ExploreBuilding.find(
				(other) => other.type === this.type && other.level === this.level + 1,
			);
		}
		return this.#levelUpBuilding;
	}

	#compositeItems: ExploreComposite[] | null = null;
	get compositeItems(): ExploreComposite[] {
		if (this.#compositeItems === null) {
			this.#compositeItems = ExploreComposite.getByBuilding(this);
		}
		return this.#compositeItems;
	}

	constructor(private row: RowWrapper) {
		this.name = localizationExploreBuildingName()(this.type);
		this.description = localizationString("ExploreBuilding")(
			this.row.get("localizationKeyDescription"),
		);
	}
}
