import * as _ from "lodash-es";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import {
	itemNameNormalization,
	localizationExploreBuildingName,
	localizationString,
} from "../localization.js";
import { ItemIconParams } from "../templates/item-icon.js";
import { ItemInfoboxParams } from "../templates/item-infobox.js";
import { wikiH2 } from "../templates/wikiheader.js";
import { wikiul } from "../templates/wikilist.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";
import { exploreItemRename } from "./config/item.js";
import { DropItemsGroup } from "./drop-items.js";
import { ExploreBuildingType } from "./enums/explore-building-type.enum.js";
import { ExploreItemPortable } from "./enums/explore-item-portable.enum.js";
import { ExploreItemsCategory } from "./enums/explore-items-category.enum.js";
import { ItemType } from "./enums/item-type.enum.js";
import { ExploreBuilding } from "./explore-building.js";
import { ExploreComposite } from "./explore-composite.js";
import { Hero } from "./hero.js";
import { ItemBase } from "./item.base.js";
import { Item } from "./item.js";

const ExploreItemsTable = ImperiumData.fromGamedata().getTable("ExploreItems");

const instances: Record<string, ExploreItem> = {};
let allInstances: ExploreItem[] | null = null;

export class ExploreItem extends ItemBase {
	public static get(id: string): ExploreItem | undefined;
	public static get(row: RowWrapper): ExploreItem;
	public static get(rowOrId: RowWrapper | string): ExploreItem {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? ExploreItemsTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new ExploreItem(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: ExploreItem) => boolean): ExploreItem | undefined {
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
		for (let i = 0; i < ExploreItemsTable.length; i++) {
			const row = ExploreItemsTable.get(i);
			yield ExploreItem.get(row);
		}
	}

	readonly itemType = ItemType.ExploreItems;

	get id(): string {
		return this.row.get("id");
	}
	private get no(): number {
		return +this.id;
	}
	get category(): ExploreItemsCategory {
		return this.row.get("category");
	}
	get effectValue(): string {
		return this.row.get("effectValue");
	}
	get iconKey(): string {
		return this.row.get("iconKey");
	}

	name: string;
	scName: string;
	description: string;

	get order(): number {
		return +this.row.get("order");
	}
	get enable() {
		if (this.no >= 1 && this.no <= 11) return false;
		if (this.no >= 10000 && this.no <= 10019) return false;
		if (this.category == ExploreItemsCategory.Transform) return false;
		return true;
	}

	get label(): string[] {
		return `${this.row.get("label")}`.split(";");
	}
	#owner: Hero | undefined | null = null;
	get owner(): Hero | undefined {
		if (this.#owner === null) {
			this.#owner = Hero.get(this.row.get("owner"));
		}
		return this.#owner;
	}
	get portable(): ExploreItemPortable {
		return this.row.get("portable");
	}
	get stackingNum(): number {
		return +this.row.get("stackingNum");
	}
	get tab(): string {
		return this.row.get("tab");
	} // enum:ExploreItemsTab
	get target(): string {
		return this.row.get("target");
	} // enum:ExploreItemsTarget

	#transformTo: Item | undefined | null = null;
	get transformTo(): Item | undefined {
		if (this.category !== ExploreItemsCategory.Transform) {
			return undefined;
		}
		if (this.#transformTo === null) {
			this.#transformTo = Item.get(this.effectValue);
		}
		return this.#transformTo;
	}

	#treasureItems: DropItemsGroup | undefined | null = null;
	get treasureItems(): DropItemsGroup | undefined {
		if (this.category !== ExploreItemsCategory.Treasure) {
			return undefined;
		}
		if (this.#treasureItems === null) {
			this.#treasureItems = DropItemsGroup.get(+this.effectValue);
		}
		return this.#treasureItems;
	}

	#composite: ExploreComposite[] | null = null;
	get composites(): ExploreComposite[] {
		if (this.#composite === null) {
			this.#composite = ExploreComposite.getByItem(this);
		}
		return this.#composite;
	}

	#usingList: Map<ExploreBuildingType, (ExploreComposite | ExploreBuilding)[]> | null = null;
	get usingList(): Map<ExploreBuildingType, (ExploreComposite | ExploreBuilding)[]> {
		if (this.#usingList === null) {
			this.#usingList = this.getUsingList();
		}
		return this.#usingList;
	}

	constructor(row: RowWrapper) {
		super(row);
		this.name = itemNameNormalization(
			localizationString("ExpItem")(row.get("localizationKeyName")) || this.iconKey,
		);
		this.scName = itemNameNormalization(
			localizationString(
				"ExpItem",
				"",
				"Key",
				"ChineseSimplified",
			)(row.get("localizationKeyName")) || this.iconKey,
		);
		this.description = localizationString("ExpItem")(row.get("localizationKeyDescription"));
	}

	private getUsingList() {
		const groupByBuilding = new Map<
			ExploreBuildingType,
			(ExploreBuilding | ExploreComposite)[]
		>();
		const useBuilding = ExploreBuilding.getAll().filter((building) =>
			building.levelUpItems.includes(this),
		);
		for (const building of useBuilding) {
			const list = groupByBuilding.get(building.type) ?? [];
			groupByBuilding.set(building.type, list);
			list.push(building);
		}
		const useComposites = ExploreComposite.getAll().filter((comp) =>
			comp.materials.includes(this),
		);
		for (const composite of useComposites) {
			if (!composite.requireBuilding) continue;
			const list = groupByBuilding.get(composite.requireBuilding.type) ?? [];
			groupByBuilding.set(composite.requireBuilding.type, list);
			list.push(composite);
		}
		return groupByBuilding;
	}

	override toWiki(options?: ItemIconParams): string {
		if (this.transformTo) {
			return this.transformTo.toWiki({
				iconUrl: this.getIconAssetUrl(options?.smallIcon),
				...options,
			});
		}
		return super.toWiki(options);
	}

	override getWikiPageName(): string {
		if (exploreItemRename[this.id]) {
			return exploreItemRename[this.id];
		}
		if (this.transformTo) {
			return this.transformTo.getWikiPageName();
		}
		return super.getWikiPageName();
	}

	override getItemInfoboxParams(): ItemInfoboxParams {
		const params = super.getItemInfoboxParams();

		params.description = params.description.replace(
			/(精神值|飽食度)\s?([x\+\-]\d+)/g,
			"{{$1|$2}}",
		);
		params.stack = this.stackingNum;
		if (this.portable != ExploreItemPortable.Normal) params.portable = this.portable;
		params.image = " ";
		return params;
	}

	toWikiTreasureList(): string {
		if (this.category == ExploreItemsCategory.Treasure) {
			return `${wikiH2("開啟寶箱獲得道具")}\n${this.treasureItems?.toWiki()}`;
		}
		return "";
	}

	toWikiCompositeList(): string {
		if (this.composites.length) {
			const showReset = this.composites.some((comp) => comp.resetDay != -1);
			const showRequireFlag = this.composites.some((comp) => comp.requireFlagId);
			const table: WikiTableStruct = [
				[
					`! 設施`,
					`! 合成素材`,
					...(showReset ? [`! 限購次數`] : []),
					...(showRequireFlag ? [`! 合成配方取得方式`] : []),
				],
			];
			for (const composite of this.composites) {
				const reset =
					composite.resetDay != -1
						? `\n(${composite.maxCount}次/${composite.resetDay}日)`
						: "-";
				table.push([
					{
						attributes: `style="text-align:center"`,
						text: composite.requireBuilding?.nameLevel ?? "",
					},
					composite.materials.toWiki(),
					...(showReset
						? [
								{
									attributes: `style="text-align: center"`,
									text: reset,
								},
						  ]
						: []),
					...(showRequireFlag
						? [
								{
									attributes: `style="text-align: center"`,
									text: composite.requireFlagId || "-",
								},
						  ]
						: []),
				]);
			}
			return `${wikiH2("合成方式")}\n${wikitable(table)}`;
		}
		return "";
	}

	toWikiUsingList(): string {
		if (this.usingList.size) {
			const list: string[] = [];
			for (const [building, usage] of this.usingList.entries()) {
				const buildingName = localizationExploreBuildingName()(building);
				const buildingList = usage
					.filter((use): use is ExploreBuilding => use instanceof ExploreBuilding)
					.map((use) => `升級至 ${use.name} Lv.${use.level + 1}。`);
				const composites = usage.filter(
					(use): use is ExploreComposite => use instanceof ExploreComposite && !!use.item,
				);
				const compositesCategories = _.groupBy(
					composites,
					(comp) => comp.item?.getWikiCategory()[0] || "探索道具",
				);
				const compositeList = Object.entries(compositesCategories).map(
					([category, composites]) =>
						`合成${category}：${composites
							.map((comp) => comp.item?.toWiki())
							.join("、")}。`,
				);
				list.push(`${buildingName}\n${wikiul([...buildingList, ...compositeList])}`);
			}
			return `${wikiH2("道具用途")}\n${wikiul(list)}`;
		}
		return "";
	}

	override toWikiPage(): string {
		return [
			this.toItemInfobox(),
			this.toWikiDropQuests(),
			this.toWikiTreasureList(),
			this.toWikiCompositeList(),
			this.toWikiUsingList(),
		]
			.filter((a) => a)
			.join("\n");
	}
}
