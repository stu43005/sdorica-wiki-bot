import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { itemNameNormalization, localizationString } from "../localization.js";
import { ItemIconParams } from "../templates/item-icon.js";
import { wikiH2 } from "../templates/wikiheader.js";
import { exploreCompositeList, exploreUsingList } from "../wiki-item.js";
import { exploreItemRename } from "./config/item.js";
import { DropItemsGroup } from "./drop-items.js";
import { ExploreItemPortable } from "./enums/explore-item-portable.enum.js";
import { ExploreItemsCategory } from "./enums/explore-items-category.enum.js";
import { ItemType } from "./enums/item-type.enum.js";
import { ExploreComposite } from "./explore-composite.js";
import { Hero } from "./hero.js";
import { Item } from "./item.js";
import { ItemBase } from "./item.base.js";
import { ItemInfoboxParams } from "../templates/item-infobox.js";

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
	get composite(): ExploreComposite[] {
		if (this.#composite === null) {
			this.#composite = ExploreComposite.getByItem(this);
		}
		return this.#composite;
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
		return exploreCompositeList(this.id);
	}

	toWikiUsingList(): string {
		return exploreUsingList(this.id);
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
