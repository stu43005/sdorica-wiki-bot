import { CronJob } from "cron";
import * as path from "path";
import requireAll from "require-all";
import { createDnsProxy } from "./src/dns-server";
import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { Logger } from './src/logger';
import { createOriginProxy } from "./src/origin-proxy";

// server mode
const logger = new Logger('main');
registerImperiumLocalLoader();

// process event handle
process
	.on('warning', logger.warn)
	.on('unhandledRejection', (error) => {
		if (error instanceof Error && error['code'] && error['details'] && error['metadata']) {
			// grpc-js Error
			return;
		}
		logger.error('Unhandled Promise Rejection:', error);
	})
	.on('uncaughtException', async (error) => {
		await logger.error('Uncaught Exception:', error);
		process.exit(1);
	});

// init origin-proxy
createOriginProxy();
createDnsProxy();

// init cron
const jobs: Record<string, () => CronJob> = requireAll({
	dirname: path.join(__dirname, 'src/crons'),
	filter: /^([^\.].*)(?<!\.ignore)\.cron\.ts$/,
	resolve: function (module) {
		return module.default;
	},
});

Object.values(jobs).forEach(job => {
	job().start();
});
