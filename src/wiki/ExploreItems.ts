import { ExploreItemPortable } from "../model/enums/explore-item-portable.enum";
import { ExploreItem } from "../model/explore-item";
import { wikiH1 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { wikiNextLine } from "../wiki-utils";

export default function wikiExploreItems() {
	let out = wikiH1("探索道具");

	const table: WikiTableStruct = {
		attributes: `class="wikitable table-responsive-autowrap" style="word-break: break-word;"`,
		rows: [
			[
				`! width="10%" | id`,
				`! width="20%" | 名稱`,
				`! 說明`,
				`! width="10%" | 分類`,
				`! width="10%" | 圖示`,
				`! width="8%" | 堆疊`,
				`! width="8%" | 攜帶性`,
			],
		],
	};
	for (const item of ExploreItem.getAll().filter(item => item.enable)) {
		table.rows.push([
			item.id,
			item.toWiki(),
			wikiNextLine(item.description),
			wikiNextLine(item.getWikiCategory().join(",\n")),
			item.iconKey,
			item.stackingNum,
			item.portable == ExploreItemPortable.Keep ? "探索失敗後不會消失" : item.portable == ExploreItemPortable.Abandon ? "探索結算後會消耗" : "",
		]);
	}

	out += `\n${wikitable(table)}`;

	return out;
}
