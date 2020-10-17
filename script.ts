import { charAssetsDownloader } from "./src/charassets-downloader";
import { downloader } from "./src/downloader";
import { gamedataTranslate } from "./src/gamedata-translate";
import { localizationChineseOnly } from "./src/localization-chinese-only";

// script mode
(async () => {
	await downloader();
	await charAssetsDownloader();
	await localizationChineseOnly();
	await gamedataTranslate();
})();
