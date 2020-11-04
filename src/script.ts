import { charAssetsDownloader } from "./charassets-downloader";
import { downloader } from "./downloader";
import { gamedataTranslate } from "./gamedata-translate";
import { localizationChineseOnly } from "./localization-chinese-only";
import { isDevMode } from "./utils";

export async function scriptMain() {
	const force = isDevMode();
	const result = await downloader(force);
	if (force || result['charAssets']) await charAssetsDownloader();
	if (force || result['localization']) await localizationChineseOnly();
	if (force || result['gamedata'] || result['localization']) await gamedataTranslate();
}
