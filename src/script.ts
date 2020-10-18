import { charAssetsDownloader } from "./charassets-downloader";
import { downloader } from "./downloader";
import { gamedataTranslate } from "./gamedata-translate";
import { localizationChineseOnly } from "./localization-chinese-only";
import { isDevMode } from "./utils";

export async function scriptMain() {
	const result = await downloader();
	if (result['charAssets']) await charAssetsDownloader();
	if (result['localization']) await localizationChineseOnly();
	if (result['gamedata'] || isDevMode()) await gamedataTranslate();
}
