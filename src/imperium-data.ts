import { ImperiumDataRaw, TableDataRaw } from "./data-raw-type";
import { Logger } from './logger';

const logger = new Logger('imperium-data');

export class ImperiumData {
	private static instances: Record<string, ImperiumData> = {};
	public static dataLoader: (self: ImperiumData) => void | Promise<void>;

	static has(name: string) {
		return name in this.instances;
	}
	static from(name: string) {
		if (!this.has(name)) {
			this.instances[name] = new ImperiumData(name);
			this.instances[name].loadData();
		}
		return this.instances[name]!;
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

	data: ImperiumDataRaw | null = null;

	constructor(public name: string) {
	}

	async loadData() {
		try {
			await ImperiumData.dataLoader(this);
		} catch (error) {
			this.data = null;
		}
	}

	reloadData() {
		this.data = null;
		return this.loadData();
	}

	private tables: Record<string, TableWrapper> = {};
	getTable(name: string) {
		if (!(name in this.tables)) {
			this.tables[name] = new TableWrapper(this, name);
		}
		return this.tables[name];
	}

	getEnum(name: string) {
		return this.data?.E[name]!;
	}

	getAsset(name: string) {
		return this.data?.A[name]!;
	}

	setRawData(data: ImperiumDataRaw) {
		this.data = data;
	}

	getRawData() {
		if (!this.data) {
			this.loadData();
		}
		return this.data!;
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
		if (!raw.C[this.name]) {
			logger.error(`table "${this.name}" not exists.`);
			debugger;
			// throw `table "${this.name}" not exists.`;
			return {
				K: [],
				T: [],
				D: [],
			};
		}
		return raw.C[this.name];
	}

	constructor(
		public data: ImperiumData,
		public name: string,
	) { }

	get length() {
		return this.table.D.length;
	}

	get colname() {
		return this.table.K;
	}

	get coltype() {
		return this.table.T;
	}

	get rows() {
		return this.table.D.map(row => new RowWrapper(row, this));
	}

	*[Symbol.iterator]() {
		for (const raw of this.table.D) {
			yield new RowWrapper(raw, this);
		}
	}

	get(index: number) {
		if (index >= this.length) {
			debugger;
			throw "out of index";
		}
		const row = this.table.D[index];
		if (!row) {
			debugger;
			throw "out of index";
		}
		return new RowWrapper(row, this);
	}

	find(predicate: (value: RowWrapper, index: number, obj: TableWrapper) => boolean) {
		if (typeof predicate !== 'function') {
			debugger;
			throw new TypeError('predicate must be a function');
		}
		const ret = this.table.D.find((row, index) => {
			const wrap = new RowWrapper(row, this);
			return predicate.call(this, wrap, index, this);
		});
		if (ret) return new RowWrapper(ret, this);
	}

	filter(predicate: (value: RowWrapper, index: number, array: RowWrapper[]) => boolean) {
		if (typeof predicate !== 'function') {
			debugger;
			throw new TypeError('predicate must be a function');
		}
		return this.rows.filter(predicate);
	}

	getColumnIndex(name: string) {
		return this.table.K.findIndex((k) => k == name);
	}

	getColumnType(index: string | number) {
		if (typeof index === "string") {
			index = this.getColumnIndex(index);
		}
		return this.table.T[index].toString();
	}
}

export class RowWrapper {
	row: any[];
	table: TableWrapper;

	constructor(row: any[], table: TableWrapper) {
		this.row = row;
		this.table = table;
	}

	get data() {
		return this.table.data;
	}

	get(index: string | number) {
		if (typeof index === "string") {
			index = this.table.getColumnIndex(index);
			if (index == -1) {
				return undefined;
			}
		}
		const type = this.table.getColumnType(index);
		let value = this.row[index];

		if (type.startsWith("enum:")) {
			if (!isNaN(Number(value))) {
				const enumData = this.data.getEnum(type);
				value = enumData && enumData[value] || value;
				if (value == -1) {
					value = null;
				}
			}
		}
		else if (type == "Boolean") {
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
		}
		if (typeof value === "string") {
			value = value.replace('\b', '');
		}
		return value;
	}

	set(index: string | number, value: any) {
		if (typeof index === "number") {
			this.row[index] = value;
			return;
		}
		const colindex = this.table.getColumnIndex(index);
		if (colindex == -1) {
			debugger;
			throw new TypeError('no such index');
		}
		this.row[colindex] = value;
	}
}
