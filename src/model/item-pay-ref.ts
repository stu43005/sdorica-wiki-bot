import { currency2Id } from "../localization";
import { Item2WikiOptions } from "../wiki-item";
import { ItemPayType } from "./enums/item-pay-type.enum";
import { ExploreItem } from "./explore-item";
import { Item } from "./item";
import { ItemBase } from "./item.base";

export class ItemPayRef {
	item?: ItemBase;

	constructor (
		public type: ItemPayType,
		public id: string,
		public amount: number = 0,
	) {
		if (this.type == ItemPayType.ExploreItem) {
			this.item = ExploreItem.get(this.id);
		} else {
			if (this.type !== ItemPayType.Item) {
				this.id = currency2Id()(type);
			}
			this.item = Item.get(this.id);
		}
	}

	toWiki(options?: Item2WikiOptions) {
		return this.item?.toWiki({
			...options,
			count: this.amount,
		}) ?? "";
	}
}
