import { Avatar } from "../model/avatar";

export default function wikiAvatars() {
	let AvatarsOut = `{| class="wikitable"
|-
! 頭像 !! 獲得途徑 !! Icon`;
	for (const avatar of Avatar.getAll().sort((a, b) => a.order - b.order)) {
		if (avatar.item) {
			AvatarsOut += `\n|- style="background-color: #ddd"`;
			AvatarsOut += `\n| ${avatar.item.toWiki()}`;
		}
		else {
			AvatarsOut += `\n|-`;
			AvatarsOut += `\n| ${avatar.hero?.toWikiSmallIcon() ?? ''}`;
		}
		AvatarsOut += ` || ${avatar.description} || ${avatar.asset}`;
	}
	AvatarsOut += `\n|}`;
	return AvatarsOut;
}
