import "../imperium-data-local.js";
//
import { createDnsProxy } from "../dns-server.js";
import { Logger } from "../logger.js";
import { createOriginProxy } from "../origin-proxy.js";

// server mode
const logger = new Logger("main");

// process event handle
process
	.on("warning", logger.warn)
	.on("unhandledRejection", (error) => {
		if (
			error instanceof Error &&
			"code" in error &&
			"details" in error &&
			"metadata" in error
		) {
			// grpc-js Error
			return;
		}
		logger.error("Unhandled Promise Rejection:", error);
	})
	.on("uncaughtException", async (error) => {
		await logger.error("Uncaught Exception:", error);
		process.exit(1);
	});

// init origin-proxy
createOriginProxy();
createDnsProxy();

// init cron
// const jobs: Record<string, () => CronJob> = requireAll({
// 	dirname: path.join(__dirname(import.meta), 'src/crons'),
// 	filter: /^([^\.].*)(?<!\.ignore)\.cron\.ts$/,
// 	resolve: function (module) {
// 		return module.default;
// 	},
// });

// Object.values(jobs).forEach(job => {
// 	job().start();
// });
