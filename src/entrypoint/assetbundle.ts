import "../imperium-data-local.js";
//
import { parseArgs } from "node:util";
import { assetBundleDownloader } from "../assetbundle/downloader.js";

const { values } = parseArgs({
	args: process.argv.slice(2),
	options: {
		force: {
			type: "boolean",
			short: "f",
			default: false,
		},
	},
});

await assetBundleDownloader(values.force);
