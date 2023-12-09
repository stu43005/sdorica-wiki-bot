import { ItemIconParams } from "../templates/item-icon.js";
import { wikiul } from "../templates/wikilist.js";
import { wikiNextLine } from "../wiki-utils.js";
import { ItemPayRef } from "./item-pay-ref.js";

export class ItemPayList {
	constructor(public items: ItemPayRef[]) {}

	includes(...args: Parameters<typeof ItemPayRef.prototype.compare>): boolean {
		return !!this.items.find((ref) => ref.compare(...args));
	}

	compare(another: ItemPayList): boolean {
		if (this === another) return true;
		if (this.items.length !== another.items.length) return false;
		return this.items.every((item, index) => another.items[index]?.compare(item));
	}

	toWiki(
		options?: ItemIconParams & {
			listType?: "space" | "ul" | "br" | "none" | "separator";
			separator?: string;
		},
	): string {
		const list = this.items.map((item) => item.toWiki(options));
		switch (options?.listType) {
			case "space":
			default:
				return list.join(" ");
			case "ul":
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
