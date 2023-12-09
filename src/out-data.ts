import { AssetDataRaw, ImperiumDataRaw, TableDataRaw } from "./data-raw-type.js";
import { filterKeyByTable, sortKeyByTable } from "./out-sort-key.js";
import { flipMatrix } from "./utils.js";

export function dataOut(data: ImperiumDataRaw) {
	const out: any[] = [];

	if (data.A) {
		assetOut(out, data.A);
		out.push([]);
	}

	if (data.C) {
		tablesOut(out, data.C);
		out.push([]);
	}

	if (data.E) {
		enumsOut(out, data.E);
		out.push([]);
	}
	return out;
}

function objectSortedForEach<T>(obj: Record<string, T>, callback: (key: string, value: T) => void) {
	const keys = Object.keys(obj);
	const sortedKeys = keys.sort((a, b) => ("" + a).localeCompare(b));
	sortedKeys.forEach((key) => {
		callback(key, obj[key]);
	});
}

export function assetOut(out: any[], assets: Record<string, AssetDataRaw>) {
	objectSortedForEach(assets, (name, asset) => {
		out.push(["##### Asset #####", name]);
		out.push(["Hash", asset.H]);
		out.push(["UUID", asset.I]);
		out.push(["Link", asset.L]);
		out.push(["Size", asset.B]);
	});
}

export function tablesOut(out: any[], tables: Record<string, TableDataRaw>) {
	objectSortedForEach(tables, (name, table) => {
		tableOut(out, name, table);
	});
}

export function tableOut(out: any[], name: string, table: TableDataRaw) {
	out.push(["##### Table #####", name]);

	// localization sort key
	table.D.push(table.T);
	table.D.push(table.K);
	const sorted = flipMatrix(
		flipMatrix(table.D).filter(filterKeyByTable(name)).sort(sortKeyByTable(name)),
	);
	table.K = sorted.pop() || [];
	table.T = sorted.pop() || [];
	table.D = sorted;

	out.push(table.K);
	out.push(table.T);
	out.push(["##### Data #####"]);
	table.D.forEach((row) => out.push(row));
}

export function enumsOut(out: any[], enums: Record<string, string[]>) {
	objectSortedForEach(enums, (name, enumm) => {
		out.push(["##### Enum #####", name]);
		out.push(enumm);
	});
}
