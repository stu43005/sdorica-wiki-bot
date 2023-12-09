import { ItemIconParams } from "../templates/item-icon.js";
import { wikiul } from "../templates/wikilist.js";
import { wikiNextLine } from "../wiki-utils.js";
import { ItemGiveRef } from "./item-give-ref.js";

export class ItemGiveList {
	public static parseList(str: string, separator = ";") {
		const items = str.split(separator);
		const refs = items.map((item) => ItemGiveRef.parseItem(item));
		return new ItemGiveList(refs);
	}

	constructor(public items: ItemGiveRef[]) {}

	compare(another: ItemGiveList) {
		if (this === another) return true;
		if (this.items.length !== another.items.length) return false;
		return this.items.every((item, index) => another.items[index]?.compare(item));
	}

	toWiki(
		options?: ItemIconParams & {
			listType?: "ul" | "br" | "none" | "separator";
			separator?: string;
		},
	) {
		const list = this.items.map((item) => item.toWiki(options));
		switch (options?.listType) {
			case "ul":
			default:
				return wikiul(list);
			case "br":
				return wikiNextLine(list.join("\n"));
			case "none":
				return list.join("");
			case "separator":
				return list.join(options?.separator ?? "\n");
		}
	}
}
