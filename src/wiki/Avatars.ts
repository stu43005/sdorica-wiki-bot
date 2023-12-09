import * as _ from "lodash-es";
import { Avatar } from "../model/avatar.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { wikiimage } from "../templates/wikiimage.js";
import { WikiTableStruct, wikitable } from "../templates/wikitable.js";

export default function wikiAvatars() {
	let out = wikiH1("頭像");

	const categorys = _.groupBy(Avatar.getAll(), (a) => a.category);

	for (const [groupId, group] of Object.entries(categorys)) {
		const table: WikiTableStruct = [[`! 頭像`, `! 獲得途徑`, `! Icon`]];
		for (const avatar of group.sort((a, b) => a.order - b.order)) {
			table.push([
				avatar.item?.toWiki() ?? avatar.hero?.toWiki() ?? "",
				avatar.description,
				`${wikiimage({
					url: avatar.getIconAssetUrl(true),
					width: 64,
				})} ${avatar.asset}`,
			]);
		}
		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
