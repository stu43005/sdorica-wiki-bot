import { downloader } from "./downloader.js";
import { gamedataTranslate } from "./gamedata-translate.js";
import { localizationChineseOnly } from "./localization-chinese-only.js";
import { isDevMode } from "./utils.js";

export async function scriptMain() {
	const force = isDevMode();
	const result = await downloader(force);
	if (force || result["localization"]) await localizationChineseOnly();
	if (force || result["gamedata"] || result["localization"]) await gamedataTranslate();
}
