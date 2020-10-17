import { CronJob } from "cron";
import { charAssetsDownloader } from "../charassets-downloader";
import { downloader } from "../downloader";
import { gamedataTranslate } from "../gamedata-translate";
import { localizationChineseOnly } from "../localization-chinese-only";

export default function () {
	// At minute 0.
	return new CronJob('0 * * * *', async () => {
		await downloader();
		await charAssetsDownloader();
		await localizationChineseOnly();
		await gamedataTranslate();
	});
}
