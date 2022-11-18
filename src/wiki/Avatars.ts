import { Avatar } from "../model/avatar";
import { wikiH1 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

export default function wikiAvatars() {
	let out = wikiH1("頭像");

	const table: WikiTableStruct = [
		[
			`! 頭像`,
			`! 獲得途徑`,
			`! Icon`,
		],
	];
	for (const avatar of Avatar.getAll().sort((a, b) => a.order - b.order)) {
		table.push({
			attributes: avatar.item ? `style="background-color: #ddd; color: #1e1e1e;"` : "",
			ceils: [
				avatar.item ? avatar.item.toWiki() : avatar.hero?.toWiki() ?? '',
				avatar.description,
				avatar.asset,
			],
		});
	}
	out += `\n${wikitable(table)}`;

	return out;
}
