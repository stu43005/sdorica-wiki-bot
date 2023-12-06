import { currency2Id } from "../localization";
import { ItemIconParams } from "../templates/item-icon";
import { ItemPayType } from "./enums/item-pay-type.enum";
import { ExploreItem } from "./explore-item";
import { Item } from "./item";
import { ItemBase } from "./item.base";

export class ItemPayRef {
	item?: ItemBase;

	public static createItem(id: string, amount = 0) {
		return new ItemPayRef(ItemPayType.Item, id, amount);
	}

	public static parseItem(str: string, separator = ":") {
		const [id, amount] = str.split(separator);
		return new ItemPayRef(ItemPayType.Item, id, +amount || 0);
	}

	constructor(public type: ItemPayType, public id: string, public amount: number = 0) {
		if (this.type == ItemPayType.ExploreItem) {
			this.item = ExploreItem.get(this.id);
		} else {
			if (this.type !== ItemPayType.Item) {
				this.id = currency2Id()(type);
			}
			this.item = Item.get(this.id);
		}
	}

	compare(another: ItemPayRef) {
		if (this === another) return true;
		return (
			this.type === another.type && this.id === another.id && this.amount === another.amount
		);
	}

	toWiki(options?: ItemIconParams) {
		let count = typeof options?.count === "number" ? options.count : 1;
		count *= this.amount;
		return (
			this.item?.toWiki({
				...options,
				count: count,
			}) ?? ""
		);
	}
}
