import * as fs from "fs-extra";
import MWBot from "mwbot";
import * as path from "path";
import { IMAGES_PATH } from "../../config";
import { ExploreItem } from "../../model/explore-item";
import { Item } from "../../model/item";
import { mkdir } from "../../out";
import { containerSearchData } from "../../viewerjs/utils";
import { getViewerJSHelper } from "../../viewerjs/viewerjs-helper-for-nodejs";

export async function wikiItemImageBot(bot: MWBot) {
	const items: (ExploreItem | Item | undefined)[] = [
		Item.get("3117"),
		Item.get("7110"),
		Item.get("500"),
		Item.get("499"),
		Item.get("7109"),
		Item.get("7111"),
		Item.get("3116"),
		Item.get("3092"),
		Item.get("3113"),
		Item.get("3114"),
		Item.get("3115"),
		Item.get("3097"),
		Item.get("3098"),
		Item.get("3099"),
		Item.get("3100"),
		Item.get("3101"),
		Item.get("3102"),
		Item.get("3109"),
		Item.get("3110"),
		Item.get("3111"),
	];

	await mkdir(IMAGES_PATH);

	for (const item of items) {
		if (item) {
			const iconKey = item.iconKey;
			const wikiPageName = item.getWikiPageName();

			await getImage(
				`assets/game/ui/item/journey_small/${iconKey}.png`,
				path.join(IMAGES_PATH, `${wikiPageName} Icon.png`)
			);
			await getImage(
				`assets/game/ui/item/mid/${item.isExplore ? "explore/" : ""}${iconKey}_m.png`,
				path.join(IMAGES_PATH, `${wikiPageName} M Icon.png`)
			);

			if (!item.isExplore) {
				if (item.avatar) {
					await getImage(
						`assets/game/character/character_image/iconl/${item.avatar.asset}_iconl.png`,
						path.join(IMAGES_PATH, `${wikiPageName} Avatar Icon L.png`)
					);
					await getImage(
						`assets/game/character/character_image/icon/${item.avatar.asset}_icon.png`,
						path.join(IMAGES_PATH, `${wikiPageName} Avatar Icon.png`)
					);
				}
			}

			console.log(wikiPageName, ":", iconKey);
		}
	}
}

async function getImage(path: string, saveTo: string) {
	try {
		const stream = await containerSearchData(getViewerJSHelper(), path);
		stream.pipe(fs.createWriteStream(saveTo));
	} catch (error) {}
}
