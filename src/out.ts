import csvStringify from "csv-stringify";
import fs from "fs-extra";
import jsonStableStringify from "json-stable-stringify";
import fetch from "node-fetch";
import * as path from "path";
import * as xlsx from "xlsx";
import { ImperiumDataRaw, TableDataRaw } from "./data-raw-type";
import { Logger } from "./logger";
import { tableOut } from "./out-data";
import { sortKeyByTable } from "./out-sort-key";
import { flipMatrix } from "./utils";

const logger = new Logger('out');

export function outCsv(filename: string, out: any[]) {
	logger.debug(`saving csv to ${filename}`);
	return new Promise<void>((resolve, reject) => {
		csvStringify(out, {
			cast: {
				boolean: (value) => value ? 'true' : 'false',
			},
		}, async function (err, data) {
			if (err) {
				reject(err);
				return;
			}
			try {
				await mkdir(path.dirname(filename));
				await fs.writeFile(filename, data, { encoding: 'utf8' });
				resolve();
			}
			catch (error) {
				reject(error);
			}
		});
	});
}

export function jsonStringify(data: any) {
	return jsonStableStringify(data, {
		space: 2,
		replacer: (key: string, value: any) => {
			if (value && typeof value === 'object' && value.K instanceof Array && value.T instanceof Array && value.D instanceof Array) {
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
	await mkdir(path.dirname(filename));
	await fs.writeFile(filename, jsonStringify(data), { encoding: 'utf8' });
}

export async function outText(filename: string, text: string) {
	logger.debug(`saving text to ${filename}`);
	await mkdir(path.dirname(filename));
	await fs.writeFile(filename, text, { encoding: 'utf8' });
}

export async function outXlsx(filename: string, data: ImperiumDataRaw) {
	logger.debug(`saving xlsx to ${filename}`);
	const wb = xlsx.utils.book_new();
	for (const [name, table] of Object.entries(data.C).sort((a, b) => a[0].localeCompare(b[0]))) {
		const out: any[] = [];
		tableOut(out, name, table);
		out.shift(); // # Table
		const keys: string[] = out.shift();
		const types: string[] = out.shift();
		out.shift(); // # Data
		const keyWithType = keys.map((key, index) => `${key} (${types[index]})`);
		out.unshift(keyWithType);

		const ws = xlsx.utils.aoa_to_sheet(out);
		ws['!autofilter'] = { ref: `A1:${xlsx.utils.encode_col(keyWithType.length - 1)}1` };
		xlsx.utils.book_append_sheet(wb, ws, name);
	}
	await mkdir(path.dirname(filename));
	xlsx.writeFile(wb, filename);
}

export async function mkdir(dirname: string) {
	const dirnames = [dirname];
	for (let i = 0; i < 3; i++) {
		const name = path.dirname(dirnames[dirnames.length - 1]);
		if (name == ".") break;
		dirnames.push(name);
	}
	while (dirnames.length) {
		try {
			const c = dirnames.pop();
			if (c) {
				await fs.mkdir(c);
			}
		}
		catch (e) { }
	}
}

export async function rpFile(url: string, filePath: string) {
	logger.debug(`downloading ${url} to ${filePath}`);
	const res = await fetch(url);
	const buffer = await res.buffer();
	await mkdir(path.dirname(filePath));
	await fs.writeFile(filePath, buffer);
}

export async function fsExists(filepath: string) {
	try {
		await fs.access(filepath);
	}
	catch (error) {
		return false;
	}
	return true;
}
