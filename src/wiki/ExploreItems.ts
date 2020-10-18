import { ExploreItemPortable } from "../model/enums/explore-item-portable.enum";
import { ExploreItem } from "../model/explore-item";
import { wikiNextLine } from "../wiki-utils";

export default function wikiExploreItems() {
	let out: string = `{| class="wikitable table-responsive-autowrap" style="word-break: break-word;"
! width="10%" | id
! width="20%" | 名稱
! 說明
! width="10%" | 分類
! width="10%" | 圖示
! width="8%" | 堆疊
! width="8%" | 攜帶性`;
	for (const item of ExploreItem.getAll().filter(item => item.enable)) {
		out += `
|-
| ${item.id}
| ${item.toWiki()}
| ${wikiNextLine(item.description)}
| ${item.getWikiCategory().join(",<br/>")}
| ${item.iconKey}
| ${item.stackingNum}
| ${item.portable == ExploreItemPortable.Keep ? "探索失敗後不會消失" : item.portable == ExploreItemPortable.Abandon ? "探索結算後會消耗" : ""}`;
	}
	out += `\n|}`;
	return out;
}
