import { charAssetsDownloader } from "./src/charassets-downloader";
import { downloader } from "./src/downloader";
import { gamedataTranslate } from "./src/gamedata-translate";
import { localizationChineseOnly } from "./src/localization-chinese-only";

// script mode
(async () => {
	const result = await downloader();
	if (result['charAssets']) await charAssetsDownloader();
	if (result['localization']) await localizationChineseOnly();
	if (result['gamedata']) await gamedataTranslate();
})();
