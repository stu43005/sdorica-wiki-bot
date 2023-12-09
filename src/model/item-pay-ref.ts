import { currency2Id } from "../localization.js";
import { ItemIconParams } from "../templates/item-icon.js";
import { PayType } from "./enums/pay-type.enum.js";
import { ExploreItem } from "./explore-item.js";
import { Item } from "./item.js";
import { ItemBase } from "./item.base.js";

export class ItemPayRef {
	item?: ItemBase;

	public static createItem(id: string, amount = 0) {
		return new ItemPayRef(PayType.Item, id, amount);
	}

	public static parseItem(str: string, separator = ":") {
		const [id, amount] = str.split(separator);
		return new ItemPayRef(PayType.Item, id, +amount || 0);
	}

	constructor(
		public type: PayType,
		public id: string,
		public amount: number = 0,
	) {
		if (this.type == PayType.ExploreItem) {
			this.item = ExploreItem.get(this.id);
		} else {
			if (this.type !== PayType.Item) {
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
