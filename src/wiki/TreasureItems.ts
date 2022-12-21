import { ExploreItemsCategory } from "../model/enums/explore-items-category.enum";
import { ItemCategory } from "../model/enums/item-category.enum";
import { ExploreItem } from "../model/explore-item";
import { Item } from "../model/item";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { wikiNextLine } from "../wiki-utils";

export default function wikiTreasureItems() {
	let out = wikiH1(`寶箱`);

	const groups = {
		道具: Item.getAll().filter((item) =>
			[ItemCategory.Treasure, ItemCategory.Voucher].includes(
				item.category
			)
		),
		探索道具: ExploreItem.getAll().filter(
			(item) => item.category == ExploreItemsCategory.Treasure
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
				item.toWiki(),
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
