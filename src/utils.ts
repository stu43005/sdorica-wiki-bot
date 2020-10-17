import config from "config";
import request from "request";
import { Logger } from './logger';

export function isDevMode() {
	return config.util.getEnv('NODE_ENV').split(',').includes('development');
}

/**
 * Check is UTF-8 string
 */
export function is_utf8(bytes: number[] | Buffer) {
	let i = 0;
	if ((
		// ASCII
		bytes[i] == 0x09 ||
		bytes[i] == 0x0A ||
		bytes[i] == 0x0D ||
		(bytes[i] >= 0x20 && bytes[i] <= 0x7E))) {
		i += 1;
		return i;
	}
	if ((
		// non-overlong 2-byte
		(bytes[i] >= 0xC2 && bytes[i] <= 0xDF) &&
		(bytes[i + 1] >= 0x80 && bytes[i + 1] <= 0xBF))) {
		i += 2;
		return i;
	}
	if ((
		// excluding overlongs
		bytes[i] == 0xE0 &&
		(bytes[i + 1] >= 0xA0 && bytes[i + 1] <= 0xBF) &&
		(bytes[i + 2] >= 0x80 && bytes[i + 2] <= 0xBF)) ||
		(
			// straight 3-byte
			((bytes[i] >= 0xE1 && bytes[i] <= 0xEC) ||
				bytes[i] == 0xEE ||
				bytes[i] == 0xEF) &&
			(bytes[i + 1] >= 0x80 && bytes[i + 1] <= 0xBF) &&
			(bytes[i + 2] >= 0x80 && bytes[i + 2] <= 0xBF)) ||
		(
			// excluding surrogates
			bytes[i] == 0xED &&
			(bytes[i + 1] >= 0x80 && bytes[i + 1] <= 0x9F) &&
			(bytes[i + 2] >= 0x80 && bytes[i + 2] <= 0xBF))) {
		i += 3;
		return i;
	}
	if ((
		// planes 1-3
		bytes[i] == 0xF0 &&
		(bytes[i + 1] >= 0x90 && bytes[i + 1] <= 0xBF) &&
		(bytes[i + 2] >= 0x80 && bytes[i + 2] <= 0xBF) &&
		(bytes[i + 3] >= 0x80 && bytes[i + 3] <= 0xBF)) ||
		(
			// planes 4-15
			(bytes[i] >= 0xF1 && bytes[i] <= 0xF3) &&
			(bytes[i + 1] >= 0x80 && bytes[i + 1] <= 0xBF) &&
			(bytes[i + 2] >= 0x80 && bytes[i + 2] <= 0xBF) &&
			(bytes[i + 3] >= 0x80 && bytes[i + 3] <= 0xBF)) ||
		(
			// plane 16
			bytes[i] == 0xF4 &&
			(bytes[i + 1] >= 0x80 && bytes[i + 1] <= 0x8F) &&
			(bytes[i + 2] >= 0x80 && bytes[i + 2] <= 0xBF) &&
			(bytes[i + 3] >= 0x80 && bytes[i + 3] <= 0xBF))) {
		i += 4;
		return i;
	}
	return false;
}

/**
 * Convert to Hexadecimal number
 * @param {number} n number
 * @returns {string} Hexadecimal number
 */
export function to16(n: number): string {
	return Number.prototype.toString.call(n, 16);
}

export function numMultiply(arg1: number, arg2: number): number {
	let m = 0;
	const s1 = arg1.toString(),
		s2 = arg2.toString();
	try {
		m += s1.split(".")[1].length;
	}
	catch (e) { }
	try {
		m += s2.split(".")[1].length;
	}
	catch (e) { }
	return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

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

export function isNumber(num: any): num is number {
	if (typeof num === 'number') {
		return num - num === 0;
	}
	if (typeof num === 'string' && num.trim() !== '') {
		return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
	}
	return false;
}

export function isEmptyObject(obj: any) {
	for (const name in obj) {
		return false;
	}
	return true;
}

export function objectEach<T>(obj: Record<string, T>, callback: (key: string, value: T) => boolean | void) {
	for (const i in obj) {
		if (callback(i, obj[i]) === false) {
			break;
		}
	}
	return obj;
}

export function objectMap<T, U>(obj: Record<string, T>, callback: (key: string, value: T) => U): Record<string, U> {
	const out: Record<string, U> = {};
	for (const i in obj) {
		out[i] = callback(i, obj[i]);
	}
	return out;
}

export function arrayUnique<T>(arr: T[]) {
	return [...new Set(arr)];
}

export function arrayGroupBy<T>(arr: T[], getter: (value: T) => number, isNumber: true): T[][];
export function arrayGroupBy<T>(arr: T[], getter: (value: T) => string, isNumber?: false): Record<string, T[]>;
export function arrayGroupBy<T>(arr: T[], getter: ((value: T) => number) | ((value: T) => string), isNumber = false): T[][] | Record<string, T[]> {
	if (isNumber) {
		const getter2 = getter as (value: T) => number;
		const out: T[][] = [];
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i];
			const key = getter2(item);
			out[key] = out[key] || [];
			out[key].push(item);
		}
		return out;
	}
	const getter2 = getter as (value: T) => string;
	const out: Record<string, T[]> = {};
	for (let i = 0; i < arr.length; i++) {
		const item = arr[i];
		const key = getter2(item);
		out[key] = out[key] || [];
		out[key].push(item);
	}
	return out;
}

export function arraySum<T>(arr: T[], getter: (value: T) => number): number {
	let sum = 0;
	for (let i = 0; i < arr.length; i++) {
		const item = arr[i];
		const value = getter(item);
		sum += value;
	}
	return sum;
}

export const flipMatrix = (matrix: any[][]) => (
	matrix.length > 0 ? matrix[0].map((column, index) => (
		matrix.map(row => row[index])
	)) : matrix
);

export const sortByCharacterModelNo = (a: string, b: string) => {
	a = String(a);
	b = String(b);
	const sa = a.replace(/^[a-zA-Z]/, "");
	const na = parseInt(sa);
	const sb = b.replace(/^[a-zA-Z]/, "");
	const nb = parseInt(sb);
	if (isNaN(na) && isNaN(nb)) {
		return a.localeCompare(b);
	}
	if (isNaN(na)) return 1;
	if (isNaN(nb)) return -1;
	if (na - nb == 0) {
		return a.localeCompare(b);
	}
	return na - nb;
};

export function jsonBlock(obj: any) {
	return "```json\n" + JSON.stringify(obj, null, '  ') + "\n```";
}
