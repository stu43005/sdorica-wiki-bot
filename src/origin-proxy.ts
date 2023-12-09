import config from "config";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { exec } from "node:child_process";
import http from "node:http";
import https from "node:https";
import { promisify } from "node:util";
import { DATA_PATH, ORIGIN_PATH } from "./config.js";
import { discordWebhook } from "./discord-webhook.js";
import { inputJsonSync } from "./input.js";
import { Logger } from "./logger.js";
import { fsExists, outJson } from "./out.js";
import { jsonBlock } from "./utils.js";

const execP = promisify(exec);

const logger = new Logger("origin-proxy");

const keys = ["charAssets", "gamedata", "localization", "settings"];
const androidKeys = ["android", "androidExp"];
const iosKeys = ["ios", "iosExp"];

let latestUUID: Record<string, string> = {};
let inProcess = false;

async function onProxyReq(
	proxyReq: http.ClientRequest,
	req: express.Request,
	res: express.Response,
) {
	logger.info("[onProxyReq]", req.path);

	const match = req.path.match(/\/([\w-]+)\/client_(latest|gamedata)\/([\w-]+)\//);
	if (match) {
		const key = match[1];
		const type = match[2];
		const uuid = match[3];
		logger.log(type, key, uuid);

		if (type == "latest" && !latestUUID[key]) {
			latestUUID[key] = uuid;
		}
	}

	if (keys.map((key) => latestUUID[key]).every((u) => u)) {
		if (androidKeys.map((key) => latestUUID[key]).every((u) => u)) {
		} else if (iosKeys.map((key) => latestUUID[key]).every((u) => u)) {
			latestUUID["ios/settings"] = latestUUID["settings"];
			latestUUID["ios/ios"] = latestUUID["ios"];
			latestUUID["ios/iosExp"] = latestUUID["iosExp"];
			delete latestUUID["settings"];
			delete latestUUID["ios"];
			delete latestUUID["iosExp"];
		} else {
			// not complete
			return;
		}

		let oldJson: Record<string, string> = {};
		if (await fsExists(ORIGIN_PATH)) {
			oldJson = inputJsonSync(ORIGIN_PATH);

			// 檢查是否全部都一樣
			if (Object.keys(latestUUID).every((key) => latestUUID[key] === oldJson[key])) {
				latestUUID = {};
				return;
			}
		}

		logger.log("All Done!");
		logger.log(JSON.stringify(latestUUID));

		discordWebhook({
			content: "new origin <:MisaDa:586572564399259669>" + jsonBlock(latestUUID),
		});

		if (inProcess) return;
		inProcess = true;

		await execP("git reset --hard && git clean -f && git pull", {
			cwd: DATA_PATH,
		});

		await outJson(ORIGIN_PATH, Object.assign({}, oldJson, latestUUID));
		latestUUID = {};

		await execP("git add origin.json && git commit -m 更新origin.json && git push", {
			cwd: DATA_PATH,
		});

		inProcess = false;
	}
}

export function createOriginProxy(port = 443) {
	const credentials = {
		key: config.get<string>("credentials.key"),
		cert: config.get<string>("credentials.cert"),
	};

	const exampleProxy = createProxyMiddleware({
		target: "https://origin-sdorica.rayark.download", // target host
		changeOrigin: true, // needed for virtual hosted sites
		ssl: credentials,
		secure: true,
		router: {
			// when request.headers.host == 'dev.localhost:3000',
			// override target 'http://www.example.org' to 'http://localhost:8000'
			// 'dev.localhost:3000': 'http://localhost:8000',
			"sdorica.rayark.download": "https://sdorica.rayark.download",
			"soe.rayark.download": "https://soe.rayark.download",
		},
		logProvider: (provider) => logger,
		// logLevel: 'debug',
		onProxyReq: onProxyReq,
	});

	const app = express();
	app.use("/", exampleProxy);

	const server = https.createServer(credentials, app);
	server.on("close", () => {
		logger.log("Origin Proxy closed");
	});
	server.listen(port, () => {
		logger.log("Origin Proxy runnig at " + port);
	});
}
