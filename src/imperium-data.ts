import { AssetDataRaw, ImperiumDataRaw, TableDataRaw } from "./data-raw-type.js";
import { Logger } from "./logger.js";
import { EnumList } from "./model/enums/index.js";

const logger = new Logger("imperium-data");

export class ImperiumData {
	private static instances: Map<string, ImperiumData> = new Map();
	public static dataLoader: (self: ImperiumData) => void | Promise<void>;

	static has(name: string): boolean {
		return this.instances.has(name);
	}
	static from(name: string): ImperiumData {
		let instance = this.instances.get(name);
		if (!instance) {
			instance = new ImperiumData(name);
			instance.loadData();
			this.instances.set(name, instance);
		}
		return instance;
	}

	static fromGamedata() {
		return this.from("gamedata");
	}
	static fromLocalization() {
		return this.from("localization");
	}
	static fromCharAssets() {
		return this.from("charAssets");
	}
	static fromDialog() {
		return this.from("dialog");
	}

	data: ImperiumDataRaw | null = null;

	constructor(public name: string) {}

	async loadData(): Promise<void> {
		try {
			await ImperiumData.dataLoader(this);
		} catch (error) {
			logger.error(error);
			this.data = null;
		}
	}

	reloadData(): Promise<void> {
		this.data = null;
		return this.loadData();
	}

	private tables: Map<string, TableWrapper> = new Map();
	getTable(name: string): TableWrapper {
		let table = this.tables.get(name);
		if (!table) {
			table = new TableWrapper(this, name);
			this.tables.set(name, table);
		}
		return table;
	}

	getEnum(name: string): string[] | undefined {
		return this.data?.E[name];
	}

	getAsset(name: string): AssetDataRaw | undefined {
		return this.data?.A[name];
	}

	setRawData(data: ImperiumDataRaw): void {
		this.data = data;
	}

	getRawData(): ImperiumDataRaw {
		if (!this.data) {
			this.loadData();
		}
		if (!this.data) {
			logger.error(`raw data not yet loaded.`);
			debugger;
			return {
				A: {},
				C: {},
				E: {},
			};
		}
		return this.data;
	}
}

export class TableWrapper implements Iterable<RowWrapper> {
	get table(): TableDataRaw {
		const raw = this.data.getRawData();
		if (!raw) {
			logger.error(`raw data not yet loaded.`);
			debugger;
			// throw `raw data not yet loaded.`;
			return {
				K: [],
				T: [],
				D: [],
			};
		}
		const table = raw.C[this.name];
		if (!table) {
			logger.error(`table "${this.name}" not exists.`);
			debugger;
			// throw `table "${this.name}" not exists.`;
			return {
				K: [],
				T: [],
				D: [],
			};
		}
		return table;
	}

	constructor(
		public data: ImperiumData,
		public name: string,
	) {}

	get length(): number {
		return this.table.D.length;
	}

	get colname(): string[] {
		return this.table.K;
	}

	get coltype(): string[] {
		return this.table.T;
	}

	#rows: RowWrapper[] | null = null;
	get rows(): RowWrapper[] {
		if (this.#rows === null) {
			this.#rows = Array.from(this);
		}
		return this.#rows;
	}

	*[Symbol.iterator](): Generator<RowWrapper, void, undefined> {
		for (const raw of this.table.D) {
			yield new RowWrapper(raw, this);
		}
	}

	get(index: number): RowWrapper {
		if (index >= this.length) {
			debugger;
			throw "out of index";
		}
		const row = this.rows[index];
		if (!row) {
			debugger;
			throw "out of index";
		}
		return row;
	}

	find(
		predicate: (value: RowWrapper, index: number, obj: TableWrapper) => boolean,
	): RowWrapper | undefined {
		if (typeof predicate !== "function") {
			debugger;
			throw new TypeError("predicate must be a function");
		}
		let index = 0;
		for (const row of this) {
			if (predicate.call(this, row, index, this)) {
				return row;
			}
			index++;
		}
		return;
	}

	filter(
		predicate: (value: RowWrapper, index: number, array: RowWrapper[]) => boolean,
	): RowWrapper[] {
		if (typeof predicate !== "function") {
			debugger;
			throw new TypeError("predicate must be a function");
		}
		return this.rows.filter(predicate);
	}

	getColumnIndex(name: string): number {
		const index = this.colname.findIndex((k) => k == name);
		if (index === -1) {
			debugger;
			logger.error(`no such column "${name}" in table "${this.name}"`);
		}
		return index;
	}

	getColumnType(index: string | number): string | undefined {
		if (typeof index === "string") {
			index = this.getColumnIndex(index);
		}
		return this.coltype[index]?.toString();
	}

	toJSON(): object[];
	toJSON<T extends TableSchema>(schema?: T): TableType<T>[];
	toJSON(schema?: TableSchema): object[] {
		return this.rows.map((row) => row.toJSON(schema));
	}
}

export class RowWrapper {
	row: any[];
	table: TableWrapper;

	constructor(row: any[], table: TableWrapper) {
		this.row = row;
		this.table = table;
	}

	get(index: string | number, expectType?: undefined): any;
	get<T extends keyof DataType | keyof EnumList>(
		index: string | number,
		expectType?: T,
	): TableColumnType<T>;
	get(index: string | number, expectType?: string): any {
		if (typeof index === "string") {
			index = this.table.getColumnIndex(index);
		}
		const type = this.table.getColumnType(index);
		if (!type) {
			return;
		}
		let value = this.row[index];

		if (expectType && type !== expectType) {
			debugger;
			throw new TypeError(
				`Field type does not match the expected value, type: "${type}", expected: "${expectType}".`,
			);
		}
		if (type.startsWith("enum:")) {
			if (!isNaN(Number(value))) {
				const enumData = this.table.data.getEnum(type);
				value = (enumData && enumData[value]) || value;
				if (value == -1) {
					value = null;
				}
			}
		} else if (type === "Asset") {
			value = this.table.data.getAsset(value);
		} else if (type === "Boolean") {
			switch (value) {
				case true:
				case "true":
				case "1":
					value = true;
					break;
				default:
					value = false;
					break;
			}
		} else if (type === "String") {
			value = "" + value;
		} else if (type === "Integer" || type === "Float") {
			value = +value;
		}
		if (typeof value === "string") {
			value = value.replace(/\b/g, "");
		}
		return value;
	}

	set(index: string | number, value: any): void {
		if (typeof index === "string") {
			index = this.table.getColumnIndex(index);
		}
		this.row[index] = value;
	}

	toJSON(): object;
	toJSON<T extends TableSchema>(schema?: T): TableType<T>;
	toJSON(schema?: TableSchema): object {
		const result = {};
		for (const column of this.table.colname) {
			Object.defineProperty(result, column, {
				value: this.get(column, schema?.[column]),
				writable: true,
				enumerable: true,
				configurable: true,
			});
		}
		if (schema) {
			for (const key of Object.keys(schema)) {
				if (!this.table.colname.includes(key)) {
					throw new TypeError(`The table missing column "${key}".`);
				}
			}
		}
		return result;
	}
}

export type TableSchema = Record<string, keyof DataType | keyof EnumList>;
export type TableType<T extends TableSchema> = {
	[K in keyof T]: TableColumnType<T[K]>;
};
type TableColumnType<T extends keyof DataType | keyof EnumList> = T extends keyof DataType
	? DataType[T]
	: T extends keyof EnumList
	  ? EnumList[T]
	  : undefined;

type DataType = {
	String: string;
	Integer: number;
	Float: number;
	Boolean: boolean;
	Asset: AssetDataRaw | undefined;
};
