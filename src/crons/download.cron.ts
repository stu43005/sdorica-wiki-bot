import { CronJob } from "cron";
import { scriptMain } from "../script.js";
import { wikiMain } from "../wiki.js";

export default function () {
	// At minute 0.
	return new CronJob("0 * * * *", async () => {
		await scriptMain();
		await wikiMain();
	});
}
