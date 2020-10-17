import { CronJob } from "cron";
import { charAssetsDownloader } from "../charassets-downloader";
import { downloader } from "../downloader";
import { gamedataTranslate } from "../gamedata-translate";
import { localizationChineseOnly } from "../localization-chinese-only";

export default function () {
	// At 00:00
	return new CronJob('0 0 * * *', async () => {
		await downloader();
		await charAssetsDownloader();
		await localizationChineseOnly();
		await gamedataTranslate();
	});
}
