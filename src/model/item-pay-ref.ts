import { currency2Id } from "../localization";
import { Item2WikiOptions, item2wikiWithType } from "../wiki-item";
import { ItemPayType } from "./enums/item-pay-type.enum";
import { ExploreItem } from "./explore-item";
import { Item } from "./item";
import { ItemBase } from "./item-base";

export class ItemPayRef {
	item?: ItemBase;

	constructor (
		public type: ItemPayType,
		public id: string,
		public amount: number = 0,
	) {
		if (type == ItemPayType.Item) {
			this.item = Item.get(id);
		} else if (type == ItemPayType.ExploreItem) {
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
