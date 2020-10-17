import { ImperiumData, RowWrapper } from "../imperium-data";
import { itemNameNormalization, localizationString } from "../localization";
import { exploreCompositeList, exploreUsingList, treasureList } from "../wiki-item";
import { ExploreItemPortable } from "./enums/explore-item-portable.enum";
import { ExploreItemsCategory } from "./enums/explore-items-category.enum";
import { Item } from "./item";
import { ItemBase } from "./item-base";

const ExploreItemsTable = ImperiumData.fromGamedata().getTable("ExploreItems");

const instances: Record<string, ExploreItem> = {};
let allInstances: ExploreItem[] | null = null;

export class ExploreItem extends ItemBase {
	public static get(row: RowWrapper): ExploreItem;
	public static get(id: string): ExploreItem | undefined;
	public static get(rowOrId: RowWrapper | string): ExploreItem {
		const id = typeof rowOrId === 'string' ? rowOrId : rowOrId.get('id');
		if (!instances[id]) {
			const row = typeof rowOrId === 'string' ? ExploreItemsTable.find(r => r.get('id') == id) : rowOrId;
			if (row) {
				instances[id] = new ExploreItem(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: ExploreItem, index: number) => boolean): ExploreItem | undefined {
		const item = ExploreItemsTable.find((row, index) => {
			const item2 = ExploreItem.get(row);
			return predicate(item2, index);
		});
		return item && ExploreItem.get(item);
	}

	public static getAll() {
		return allInstances ?? (allInstances = Array.from(this.getAllGenerator()));
	}

	public static *getAllGenerator() {
		for (let i = 0; i < ExploreItemsTable.length; i++) {
			const row = ExploreItemsTable.get(i);
			yield ExploreItem.get(row);
		}
	}

	get isExplore(): boolean { return true; }

	get id(): string { return this.row.get('id'); }
	get no(): number { return +this.id; }
	get category(): ExploreItemsCategory { return this.row.get('category'); }
	get effectValue(): string { return this.row.get('effectValue'); }
	get iconKey(): string { return `${this.row.get('iconKey')}`.replace(/Explore\//g, ''); }

	name: string;
	description: string;

	get enable() {
		if (this.no >= 1 && this.no <= 11) return false;
		if (this.no >= 10000 && this.no <= 10019) return false;
		if (this.category == ExploreItemsCategory.Transform) return false;
		return true;
	}

	get label(): string[] { return `${this.row.get('label')}`.split(';'); }
	get owner(): string { return this.row.get('owner'); }
	get portable(): ExploreItemPortable { return this.row.get('portable'); }
	get stackingNum(): number { return +this.row.get('stackingNum'); }
	get tab(): string { return this.row.get('tab'); } // enum:ExploreItemsTab
	get target(): string { return this.row.get('target'); } // enum:ExploreItemsTarget

	constructor(row: RowWrapper) {
		super(row);
		this.name = itemNameNormalization(localizationString("ExpItem")(row.get('localizationKeyName')) || this.iconKey);
		this.description = localizationString("ExpItem")(row.get('localizationKeyDescription'));
	}

	getTransformTo() {
		if (this.category != ExploreItemsCategory.Transform) { return; }
		return Item.get(this.effectValue);
	}

	getItemInfoboxParams() {
		const params = super.getItemInfoboxParams();

		params.description = params.description.replace(/(精神值|飽食度)\s?([x\+\-]\d+)/g, '{{$1|$2}}');
		params.stack = this.stackingNum;
		if (this.portable != ExploreItemPortable.Normal) params.portable = this.portable;
		params.image = ' ';
		return params;
	}

	getWikiTreasureList() {
		if (this.category == ExploreItemsCategory.Treasure) {
			return "== 開啟寶箱獲得道具 ==" + treasureList(+this.effectValue);
		}
		return '';
	}

	getWikiCompositeList() {
		return exploreCompositeList(this.id);
	}

	getWikiUsingList() {
		return exploreUsingList(this.id);
	}

	getWikiPage() {
		return [
			this.getItemInfobox(),
			this.getWikiDropQuests(),
			this.getWikiTreasureList(),
			this.getWikiCompositeList(),
			this.getWikiUsingList(),
		].filter(a => a).join('\n');
	}

}
