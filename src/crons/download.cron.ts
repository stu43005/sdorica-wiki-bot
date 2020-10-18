import { CronJob } from "cron";
import { scriptMain } from "../script";
import { wikiMain } from "../wiki";

export default function () {
	// At minute 0.
	return new CronJob('0 * * * *', async () => {
		await scriptMain();
		await wikiMain();
	});
}
