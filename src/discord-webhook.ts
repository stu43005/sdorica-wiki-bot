import config from "config";
import request from "request";

export function discordWebhook(data: any) {
	if (!config.get('dcWebhook')) {
		console.log("Not set DC_WEBHOOK.");
		return;
	}
	return new Promise<void>((resolve, reject) => {
		request.post({
			url: config.get<string>('dcWebhook'),
			formData: data,
		}, (err, httpResponse, body) => {
			if (err) {
				console.error(err);
				debugger;
				return reject(err);
			}
			switch (httpResponse.statusCode) {
				case 403:
					console.error(body);
					debugger;
					return reject(body);
			}
			resolve();
		});
	});
}
