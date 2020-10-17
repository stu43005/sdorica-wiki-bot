import { currency2Id } from "../localization";
import { Item2WikiOptions, item2wikiWithType } from "../wiki-item";
import { ItemGiveType } from "./enums/item-give-type.enum";
import { ExploreItem } from "./explore-item";
import { Item } from "./item";
import { ItemBase } from "./item-base";

export class ItemGiveRef {
	item?: ItemBase;

	constructor (
		public type: ItemGiveType,
		public id: string,
		public amount: number = 0,
	) {
		if (type == ItemGiveType.Item) {
			this.item = Item.get(id);
		} else if (type == ItemGiveType.ExploreItem) {
			this.item = ExploreItem.get(id);
		} else {
			const id2 = currency2Id()(type);
			if (id2) {
				this.id = id2;
				this.item = Item.get(id2);
			}
		}
	}

	toWiki(options?: Item2WikiOptions) {
		return item2wikiWithType(this.type, this.id, this.amount, options);
	}
}
