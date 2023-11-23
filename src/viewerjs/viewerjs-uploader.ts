import config from "config";
import * as fs from "fs-extra";
import glob from "glob";
import fetch from "node-fetch";
import * as path from "path";
import { Logger } from "../logger";

const logger = new Logger("viewerjs-uploader");

export async function putToSI(name: string) {
	const bundle = await fs.readFile(
		path.join(__dirname, `../../dist/viewerjs/${name}.bundle.js`),
		"utf-8"
	);

	let helperName = "this";
	if (name === "$ViewerInit") {
		helperName = "data";
	}

	const script = `(data) => {
	const self = ${helperName};
	${bundle}
	if (self['${name}'] && self['${name}'].default) {
		return self['${name}'].default(self, data);
	}
	return { error: '${name} no default export' };
}`;

	const response = await fetch(`https://${config.get("siDomain")}/api/viewer_js/${name}/`, {
		method: "PUT",
		headers: {
			cookie: config.get("siCookie"),
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			javascript: script,
			unity_type: name,
		}),
	});
	logger.log(`Success put ${name} to SI.`);
	return response.json();
}

export async function viewerJSUploader() {
	const entry = glob
		.sync(path.resolve(__dirname, "./entry/*.ts"))
		.map((file) => path.basename(file, ".ts"));
	for (const name of entry) {
		await putToSI(name);
	}
}
