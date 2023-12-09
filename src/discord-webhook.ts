import config from "config";
import { Logger } from "./logger.js";

const logger = new Logger("discord-webhook");

export async function discordWebhook(data: any) {
	const url = config.get<string>("dcWebhook");
	if (!url) {
		logger.log("DC_WEBHOOK not set.");
		return;
	}
	logger.debug(data);
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (response.status >= 400) {
		logger.error(`Failed to call webhook with following error:`, await response.json());
	}
}
