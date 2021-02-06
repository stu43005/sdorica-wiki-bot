import { ExploreItemsCategory } from '../model/enums/explore-items-category.enum';
import { ItemCategory } from "../model/enums/item-category.enum";
import { Item } from "../model/item";
import { wikiNextLine } from "../wiki-utils";
import { ExploreItem } from './../model/explore-item';

export default function wikiTreasureItems() {
	let out = `== 道具 ==
{| class="wikitable" style="width: 100%;"
! id !! 名稱
! style="width: 30%;" | 說明 !! 圖示
! style="width: 35%;" | 寶箱內容`;
	for (const item of Item.getAll().filter(item => item.category == ItemCategory.Treasure)) {
		out += `
|-
| ${item.id}
| ${item.toWiki()}
| ${wikiNextLine(item.description)}
| ${item.iconKey}
| ${item.getWikiTreasureList('')}`;
	}
	out += "\n|}";
	out += `\n== 探索道具 ==
{| class="wikitable" style="width: 100%;"
! id !! 名稱
! style="width: 30%;" | 說明 !! 圖示
! style="width: 35%;" | 寶箱內容`;
	for (const item of ExploreItem.getAll().filter(item => item.category == ExploreItemsCategory.Treasure)) {
		out += `
|-
| ${item.id}
| ${item.toWiki()}
| ${wikiNextLine(item.description)}
| ${item.iconKey}
| ${item.getWikiTreasureList('')}`;
	}
	out += "\n|}";
	return out;
}
