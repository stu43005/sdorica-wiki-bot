import csvStringify from "csv-stringify";
import jsonStableStringify from "json-stable-stringify";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { ImperiumDataRaw, TableDataRaw } from "./data-raw-type.js";
import { Logger } from "./logger.js";
import { tableOut } from "./out-data.js";
import { sortKeyByTable } from "./out-sort-key.js";
import { axios } from "./utilities/axios.js";
import { XLSX } from "./utilities/xlsx.js";
import { flipMatrix } from "./utils.js";

const logger = new Logger("out");

export function outCsv(filename: string, out: any[]) {
	logger.debug(`saving csv to ${filename}`);
	return new Promise<void>((resolve, reject) => {
		csvStringify(
			out,
			{
				cast: {
					boolean: (value) => (value ? "true" : "false"),
				},
			},
			async function (err, data) {
				if (err) {
					reject(err);
					return;
				}
				try {
					await fsp.mkdir(path.dirname(filename), {
						recursive: true,
					});
					await fsp.writeFile(filename, data, { encoding: "utf8" });
					resolve();
				} catch (error) {
					reject(error);
				}
			},
		);
	});
}

export function jsonStringify(data: any) {
	return jsonStableStringify(data, {
		space: 2,
		replacer: (key: string, value: any) => {
			if (
				value &&
				typeof value === "object" &&
				value.K instanceof Array &&
				value.T instanceof Array &&
				value.D instanceof Array
			) {
				const table = value as TableDataRaw;
				table.D.push(table.T);
				table.D.push(table.K);
				const sorted = flipMatrix(flipMatrix(table.D).sort(sortKeyByTable()));
				table.K = sorted.pop() || [];
				table.T = sorted.pop() || [];
				table.D = sorted;
			}
			return value;
		},
	});
}

export async function outJson(filename: string, data: any) {
	logger.debug(`saving json to ${filename}`);
	await fsp.mkdir(path.dirname(filename), {
		recursive: true,
	});
	await fsp.writeFile(filename, jsonStringify(data), { encoding: "utf8" });
}

export async function outText(filename: string, text: string) {
	logger.debug(`saving text to ${filename}`);
	await fsp.mkdir(path.dirname(filename), {
		recursive: true,
	});
	await fsp.writeFile(filename, text, { encoding: "utf8" });
}

export async function outXlsx(filename: string, data: ImperiumDataRaw) {
	logger.debug(`saving xlsx to ${filename}`);
	const wb = XLSX.utils.book_new();
	for (const [name, table] of Object.entries(data.C).sort((a, b) => a[0].localeCompare(b[0]))) {
		const out: any[] = [];
		tableOut(out, name, table);
		out.shift(); // # Table
		const keys: string[] = out.shift();
		const types: string[] = out.shift();
		out.shift(); // # Data
		const keyWithType = keys.map((key, index) => `${key} (${types[index]})`);
		out.unshift(keyWithType);

		const ws = XLSX.utils.aoa_to_sheet(out);
		ws["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(keyWithType.length - 1)}1` };
		XLSX.utils.book_append_sheet(wb, ws, name);
	}
	await fsp.mkdir(path.dirname(filename), {
		recursive: true,
	});
	XLSX.writeFile(wb, filename);
}

export async function rpFile(url: string, filePath: string) {
	logger.debug(`downloading ${url} to ${filePath}`);
	await fsp.mkdir(path.dirname(filePath), {
		recursive: true,
	});
	const res = await axios({
		method: "GET",
		url: url,
		responseType: "stream",
	});
	const ws = fs.createWriteStream(filePath);
	res.data.pipe(ws);
	return new Promise((resolve, reject) => {
		ws.on("finish", resolve);
		ws.on("error", reject);
	});
}

export async function fsExists(filepath: string) {
	try {
		await fsp.access(filepath);
	} catch (error) {
		return false;
	}
	return true;
}

export function fileBasename(filename: string): string {
	return path.basename(filename, path.extname(filename));
}

export async function cleanEmptyFoldersRecursively(folder: string) {
	const stat = await fsp.stat(folder);
	const isDir = stat.isDirectory();
	if (!isDir) {
		return;
	}
	let files = await fsp.readdir(folder);
	if (files.length > 0) {
		for (const file of files) {
			const fullPath = path.join(folder, file);
			await cleanEmptyFoldersRecursively(fullPath);
		}

		files = await fsp.readdir(folder);
	}

	if (files.length == 0) {
		await fsp.rmdir(folder);
		return;
	}
}
