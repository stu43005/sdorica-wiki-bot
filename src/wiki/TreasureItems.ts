import { ExploreItemsCategory } from "../model/enums/explore-items-category.enum.js";
import { ItemCategory } from "../model/enums/item-category.enum.js";
import { ExploreItem } from "../model/explore-item.js";
import { Item } from "../model/item.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";
import { wikiNextLine } from "../wiki-utils.js";

export default function wikiTreasureItems() {
	let out = wikiH1(`寶箱`);

	const groups = {
		道具: Item.getAll().filter((item) =>
			[ItemCategory.Treasure, ItemCategory.Voucher].includes(item.category),
		),
		探索道具: ExploreItem.getAll().filter(
			(item) => item.category == ExploreItemsCategory.Treasure,
		),
	};

	for (const [groupName, group] of Object.entries(groups)) {
		const tableItem: WikiTableStruct = [
			[
				`! id`,
				`! 名稱`,
				`! style="width: 30%;" | 說明`,
				`! 圖示`,
				`! style="width: 35%;" | 寶箱內容`,
			],
		];

		for (const item of group) {
			tableItem.push([
				item.id,
				wikiH3(item.toWiki(), item.id, true),
				wikiNextLine(item.description),
				item.iconKey,
				"treasureItems" in item && item.treasureItems
					? item.treasureItems.toWiki()
					: "voucherGifts" in item && item.voucherGifts
					  ? item.voucherGifts.toWiki()
					  : "",
			]);
		}

		out += `\n\n${wikiH2(groupName)}\n${wikitable(tableItem)}`;
	}

	return out;
}
