import { ImperiumData, RowWrapper } from "../imperium-data";
import { itemNameNormalization, localizationString } from "../localization";
import { wikiH2 } from "../templates/wikiheader";
import { exploreCompositeList, exploreUsingList } from "../wiki-item";
import { exploreItemRename } from "./config/item";
import { DropItemsGroup } from "./drop-items";
import { ExploreItemPortable } from "./enums/explore-item-portable.enum";
import { ExploreItemsCategory } from "./enums/explore-items-category.enum";
import { Item } from "./item";
import { ItemBase } from "./item.base";

const ExploreItemsTable = ImperiumData.fromGamedata().getTable("ExploreItems");

const instances: Record<string, ExploreItem> = {};
let allInstances: ExploreItem[] | null = null;

export class ExploreItem extends ItemBase {
	public static get(row: RowWrapper): ExploreItem;
	public static get(id: string): ExploreItem | undefined;
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
		for (let i = 0; i < ExploreItemsTable.length; i++) {
			const row = ExploreItemsTable.get(i);
			yield ExploreItem.get(row);
		}
	}

	readonly isExplore = true;

	get id(): string {
		return this.row.get("id");
	}
	get no(): number {
		return +this.id;
	}
	get category(): ExploreItemsCategory {
		return this.row.get("category");
	}
	get effectValue(): string {
		return this.row.get("effectValue");
	}
	get iconKey(): string {
		return `${this.row.get("iconKey")}`.replace(/Explore\//g, "");
	}

	name: string;
	scName: string;
	description: string;

	get enable() {
		if (this.no >= 1 && this.no <= 11) return false;
		if (this.no >= 10000 && this.no <= 10019) return false;
		if (this.category == ExploreItemsCategory.Transform) return false;
		return true;
	}

	get label(): string[] {
		return `${this.row.get("label")}`.split(";");
	}
	get owner(): string {
		return this.row.get("owner");
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

	constructor(row: RowWrapper) {
		super(row);
		this.name = itemNameNormalization(
			localizationString("ExpItem")(row.get("localizationKeyName")) || this.iconKey
		);
		this.scName = itemNameNormalization(
			localizationString(
				"ExpItem",
				"",
				"Key",
				"ChineseSimplified"
			)(row.get("localizationKeyName")) || this.iconKey
		);
		this.description = localizationString("ExpItem")(row.get("localizationKeyDescription"));
	}

	getWikiPageName() {
		if (exploreItemRename[this.id]) {
			return exploreItemRename[this.id];
		}
		if (this.transformTo) {
			return this.transformTo.getWikiPageName();
		}
		return super.getWikiPageName();
	}

	getItemInfoboxParams() {
		const params = super.getItemInfoboxParams();

		params.description = params.description.replace(
			/(精神值|飽食度)\s?([x\+\-]\d+)/g,
			"{{$1|$2}}"
		);
		params.stack = this.stackingNum;
		if (this.portable != ExploreItemPortable.Normal) params.portable = this.portable;
		params.image = " ";
		return params;
	}

	toWikiTreasureList() {
		if (this.category == ExploreItemsCategory.Treasure) {
			return `${wikiH2("開啟寶箱獲得道具")}\n${this.treasureItems?.toWiki()}`;
		}
		return "";
	}

	toWikiCompositeList() {
		return exploreCompositeList(this.id);
	}

	toWikiUsingList() {
		return exploreUsingList(this.id);
	}

	toWikiPage() {
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
