import msgpack5 from "msgpack5";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import streamToPromise from "stream-to-promise";
import { DataRaw, ImperiumDataRaw, LatestDataRaw } from "./data-raw-type.js";
import { fsExists } from "./out.js";

export async function* inputDir(
	dirname: string,
	includeSubDir = true,
): AsyncGenerator<{ filepath: string; filename: string; stat: fs.Stats }, void, unknown> {
	const files: string[] = await fsp.readdir(dirname);
	while (files.length > 0) {
		const file = files.shift();
		if (file == "." || file == "..") continue;
		if (file) {
			const name = path.join(dirname, file);
			const stat = await fsp.stat(name);
			if (includeSubDir && stat.isDirectory()) {
				yield* inputDir(name, includeSubDir);
			} else if (stat.isFile()) {
				yield {
					filepath: name,
					filename: file,
					stat,
				};
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
			if (!table) continue;
			for (let j = 0; j < table.T.length; j++) {
				const type = table.T[j];
				if (!type) continue;
				if (("" + type).startsWith("enum:") && type in data.E) {
					const enumm = data.E[type];
					for (let k = 0; k < table.D.length; k++) {
						const row = table.D[k];
						if (!row) continue;
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
				raw[curKey] &&
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
