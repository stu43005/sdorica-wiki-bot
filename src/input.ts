import * as fs from "fs-extra";
import msgpack5 from "msgpack5";
import * as path from "path";
import * as readline from "readline";
import streamToPromise from "stream-to-promise";
import { DataRaw, ImperiumDataRaw, LatestDataRaw } from "./data-raw-type";
import { fsExists } from "./out";

export async function inputDir(
	dirname: string,
	callback: (name: string, file: fs.Stats) => Promise<void>,
	includeSubDir = false
) {
	const files: string[] = await fs.readdir(dirname);
	while (files.length > 0) {
		const file = files.shift();
		if (file == "." || file == "..") continue;
		if (file) {
			const name = path.join(dirname, file);
			const stat = await fs.stat(name);
			if (includeSubDir && stat.isDirectory()) {
				await inputDir(name, callback, includeSubDir);
			} else if (stat.isFile()) {
				await callback.call(name, name, stat);
			}
		}
	}
}

export function inputJsonSync<T = any>(filepath: string): T {
	const content = fs.readFileSync(filepath, { encoding: "utf8" });
	const json = JSON.parse(content);
	return json;
}

export async function inputJsonDefault<T = any>(filepath: string, def: T): Promise<T> {
	try {
		if (await fsExists(filepath)) {
			return inputJsonSync<T>(filepath);
		}
	} catch (error) {}
	return def;
}

/**
 * Read file using MessagePack.
 */
export async function inputFilePack(filepath: string): Promise<DataRaw> {
	const msgpack = msgpack5();
	const stream = fs.createReadStream(filepath).pipe(msgpack.decoder());
	const raw = (await streamToPromise(stream)) as any;
	const data = raw[0] as DataRaw;
	if (isImperiumData(data)) {
		processTableData(data);
	} else if (isLatestData(data)) {
		processLatestData(data);
	}
	return data;
}

export function isLatestData(data: DataRaw): data is LatestDataRaw {
	return data && typeof (<LatestDataRaw>data).R != "undefined";
}

export function isImperiumData(data: DataRaw): data is ImperiumDataRaw {
	return data && typeof (<ImperiumDataRaw>data).C != "undefined";
}

function processLatestData(data: LatestDataRaw) {
	if (!isLatestData(data)) return;
	data[`CT(ISO)`] = new Date(data["CT"] * 1000).toISOString();
	data[`PT(ISO)`] = new Date(data["PT"] * 1000).toISOString();
}

function processTableData(data: ImperiumDataRaw) {
	if (!isImperiumData(data) || !data.E) return;
	for (const tableName in data.C) {
		if (data.C.hasOwnProperty(tableName)) {
			const table = data.C[tableName];
			for (let j = 0; j < table.T.length; j++) {
				const type = table.T[j];
				if (("" + type).startsWith("enum:") && type in data.E) {
					const enumm = data.E[type];
					for (let k = 0; k < table.D.length; k++) {
						const row = table.D[k];
						if (isNaN(Number(row[j]))) {
							continue;
						}
						if (enumm) {
							row[j] = enumm[row[j]] || row[j];
						} else {
							row[j] = row[j];
						}
					}
				}
			}
		}
	}
}

/**
 * Read MonoBehaviour file then return State
 * @param {string} filepath File path
 * @returns {Promise<{ [key: string]: any }>} unserialized State key-value pair
 */
export function inputMonoBehaviour(filepath: string): Promise<Record<string, any[]>> {
	return new Promise<Record<string, any[]>>((resolve) => {
		const rl = readline.createInterface({
			input: fs.createReadStream(filepath, "utf8"),
			crlfDelay: Infinity,
		});

		const raw: Record<string, any[]> = {};
		const size: Record<string, number> = {};
		let curKey = "";
		let curIndex = -1;

		rl.on("line", (line) => {
			const tokens = line.trim().split(" ");
			if (tokens[0] == "vector") {
				curKey = tokens[1];
				raw[curKey] = [];
				curIndex = -1;
			} else if (curKey && tokens.length == 4 && tokens[1] == "size") {
				size[curKey] = Number(tokens[3]);
			} else if (curKey && size[curKey] && line.match(/^\s*\[\d+\]$/)) {
				const match = line.match(/^\s*\[(\d+)\]$/);
				if (match) curIndex = Number(match[1]);
			} else if (
				curKey &&
				size[curKey] &&
				curIndex > -1 &&
				line.indexOf("string data") != -1
			) {
				let data = line.substring(line.indexOf('"') + 1, line.length - 1);
				try {
					data = JSON.parse(data.replace(/\:(-?)\.(\d)/g, ":$10.$2"));
				} catch (error) {}
				raw[curKey][curIndex] = data;

				if (raw[curKey].length >= size[curKey]) {
					curKey = "";
				}
			}
		}).on("close", () => {
			const out: Record<string, any[]> = {};
			for (const key in raw) {
				if (raw.hasOwnProperty(key)) {
					const value = raw[key];
					if (key == "_serializedStateKeys") {
						const _serializedStateKeys = value;
						const _serializedStateValues = raw["_serializedStateValues"];
						for (let i = 0; i < _serializedStateKeys.length; i++) {
							const key2 = _serializedStateKeys[i];
							const value2 = _serializedStateValues[i];
							out[key2] = value2;
						}
					} else if (key == "_serializedStateValues") {
						// do nothing
					} else if (key == "_objectReferences") {
						// do nothing
					} else {
						out[key] = value;
					}
				}
			}
			resolve(out);
		});
	});
}
