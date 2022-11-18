export function isDevMode() {
	return process.env.NODE_ENV === 'development';
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

/**
 * Yields the numbers in the given range as an array
 *
 * @param start - The start of the range
 * @param end - The end of the range (inclusive)
 * @param step - The amount to increment between each number
 * @example
 * Basic range
 * ```ts
 * range(3, 5); // [3, 4, 5]
 * ```
 * @example
 * Range with a step
 * ```ts
 * range(3, 10, 2); // [3, 5, 7, 9]
 * ```
 */
export function range(start: number, end: number, step = 1): number[] {
	return Array.from({ length: (end - start) / step + 1 }, (_, index) => start + index * step);
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

export function arraySortBy(order: string[]) {
	return (a: string, b: string) => {
		const ai = order.indexOf(a);
		const bi = order.indexOf(b);
		if (ai == -1 && bi == -1) {
			return a.localeCompare(b);
		}
		if (ai == -1) {
			return 1;
		}
		if (bi == -1) {
			return -1;
		}
		return ai - bi;
	}
}

export const flipMatrix = (matrix: any[][]) => (
	matrix.length > 0 ? matrix[0].map((column, index) => (
		matrix.map(row => row[index])
	)) : matrix
);

export const sortByCharacterModelNo = (a: string, b: string) => {
	a = String(a);
	b = String(b);
	const na = parseInt(a.replace(/^[a-zA-Z]/, ""), 10);
	const nb = parseInt(b.replace(/^[a-zA-Z]/, ""), 10);
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

export function sortCategory(a: string, b: string) {
	const aMatch = a.match(/^([a-zA-Z]+)(\d+)$/);
	const bMatch = b.match(/^([a-zA-Z]+)(\d+)$/);
	if (aMatch && bMatch && aMatch[1] == bMatch[1]) {
		const aNumber = parseInt(aMatch[2], 10);
		const bNumber = parseInt(bMatch[2], 10);
		const diff = aNumber - bNumber;
		if (diff) {
			return diff;
		}
	}
	return a.localeCompare(b);
}

export function jsonBlock(obj: any) {
	return "```json\n" + JSON.stringify(obj, null, '  ') + "\n```";
}
