import config from "config";
import fetch from 'node-fetch';
import { Logger } from './logger';

const logger = new Logger('discord-webhook');

export async function discordWebhook(data: any) {
	const url = config.get<string>('dcWebhook');
	if (!url) {
		logger.log("DC_WEBHOOK not set.");
		return;
	}
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: data,
	});
	return response.text();
}
