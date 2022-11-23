import _ from "lodash";
import { Avatar } from "../model/avatar";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

export default function wikiAvatars() {
	let out = wikiH1("頭像");

	const categorys = _.groupBy(Avatar.getAll(), (a) => a.category);

	for (const [groupId, group] of Object.entries(categorys)) {
		const table: WikiTableStruct = [
			[
				`! 頭像`,
				`! 獲得途徑`,
				`! Icon`,
			],
		];
		for (const avatar of group.sort((a, b) => a.order - b.order)) {
			table.push([
				avatar.item ? avatar.item.toWiki() : avatar.hero?.toWiki() ?? '',
				avatar.description,
				avatar.asset,
			]);
		}
		out += `\n\n${wikiH2(groupId)}\n${wikitable(table)}`;
	}

	return out;
}
