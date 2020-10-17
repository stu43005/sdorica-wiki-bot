import { ImperiumData, RowWrapper } from "../imperium-data";
import { itemNameNormalization, localizationString } from "../localization";
import { treasureList } from "../wiki-item";
import { Avatar } from './avatar';
import { ExploreItemsCategory } from './enums/explore-items-category.enum';
import { ItemCategory } from './enums/item-category.enum';
import { ItemStackable } from './enums/item-stackable.enum';
import { ExploreItem } from './explore-item';
import { ItemBase } from './item-base';
import { ItemGiveRef } from "./item-give-ref";

const ItemsTable = ImperiumData.fromGamedata().getTable("Items");

const instances: Record<string, Item> = {};
let allInstances: Item[] | null = null;

export class Item extends ItemBase {
	public static get(row: RowWrapper): Item;
	public static get(id: string): Item | undefined;
	public static get(rowOrId: RowWrapper | string): Item {
		const id = typeof rowOrId === 'string' ? rowOrId : rowOrId.get('id');
		if (!instances[id]) {
			const row = typeof rowOrId === 'string' ? ItemsTable.find(r => r.get('id') == id) : rowOrId;
			if (row) {
				instances[id] = new Item(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: Item, index: number) => boolean): Item | undefined {
		const item = ItemsTable.find((row, index) => {
			const item2 = Item.get(row);
			return predicate(item2, index);
		});
		return item && Item.get(item);
	}

	public static getAll() {
		return allInstances ?? (allInstances = Array.from(this.getAllGenerator()));
	}

	public static *getAllGenerator() {
		for (let i = 0; i < ItemsTable.length; i++) {
			const row = ItemsTable.get(i);
			yield Item.get(row);
		}
	}

	get isExplore(): boolean { return false; }

	get id(): string { return this.row.get('id'); }
	get no(): number { return +this.id; }
	get category(): ItemCategory { return this.row.get('category'); }
	get effectValue(): number { return +this.row.get('effectValue'); }
	get iconKey(): string { return this.row.get('iconKey'); }
	get rank(): number { return +this.row.get('rank'); }

	name: string;
	description: string;
	get internalName(): string { return this.row.get('name'); }

	get enable() {
		if (this.no > 20000 && this.no < 30000) {
			// 由ExploreItem轉移過來的道具
			if (ExploreItem.find(item => item.category == ExploreItemsCategory.Transform && item.effectValue == this.id)) return true;
			// 同樣道具同時存在在ExploreItem (用作關卡獎勵圖示)，無用
			if (ExploreItem.find(item => item.name == this.name)) return false;
		}
		return true;
	}

	#sellItem: ItemGiveRef | null = null;
	get sellItem(): ItemGiveRef {
		return this.#sellItem ?? (this.#sellItem = new ItemGiveRef(this.row.get('sellType'), this.row.get('sellLinkId'), this.row.get('sellAmount')));
	}

	get stackable(): ItemStackable { return this.row.get('stackable'); }
	get viewable(): boolean { return !!this.row.get('viewable'); }
	get stackingNum(): number { return +this.row.get('stackingNum'); }

	constructor(row: RowWrapper) {
		super(row);
		this.name = itemNameNormalization(localizationString("Item")(row.get('localizationKeyName')) || this.internalName || this.iconKey);
		this.description = localizationString("Item")(row.get('localizationKeyDescription'));
	}

	getAvatar() {
		if (this.category == ItemCategory.Avatar) {
			return Avatar.get(this.effectValue.toString());
		}
	}

	getTransformExploreItems() {
		return ExploreItem.getAll().filter(item => item.getTransformTo() == this);
	}

	getItemInfoboxParams() {
		const params = super.getItemInfoboxParams();
		const category = params.category;

		if (category.includes("技能書") || category.includes("造型書") || category.includes("頭像")) {
			params.image = " ";
		}
		if (category.includes("造型書")) {
			params.sort = "👕";
		}
		if (this.sellItem.amount && !category.includes("蒐集")) {
			params.currency = this.sellItem.item?.name;
			params.price = this.sellItem.amount;
		}

		params.rank = this.rank;
		params.viewable = this.viewable;
		return params;
	}

	getWikiTreasureList(heading = '== 開啟寶箱獲得道具 ==') {
		if (this.category == ItemCategory.Treasure) {
			return heading + treasureList(this.effectValue);
		}
		return '';
	}

	getWikiCompositeList() {
		return this.getTransformExploreItems().map(item => item.getWikiCompositeList()).join('');
	}

	getWikiPage() {
		return [
			this.getItemInfobox(),
			this.getAvatar()?.getAvatarInfobox() ?? '',
			this.getWikiDropQuests(),
			this.getWikiTreasureList(),
			this.getWikiCompositeList(),
		].filter(a => a).join('\n');
	}

}
