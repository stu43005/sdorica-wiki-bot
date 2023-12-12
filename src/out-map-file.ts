import path from "node:path";
import { inputJsonSync } from "./input.js";
import { outJson } from "./out.js";
import { ResourceFile } from "./out-resource-file.js";

export class MapFile<T> extends ResourceFile<Map<string, T>> {
	constructor(private filePath: string) {
		super(path.basename(filePath));
	}

	protected loadData(): Map<string, T> {
		try {
			return new Map(Object.entries(inputJsonSync<Record<string, T>>(this.filePath)));
		} catch (error) {}
		return new Map();
	}

	protected async cleanupData(data: Map<string, T>): Promise<void> {
		this.logger.info(`Saving file...: ${this.filePath}`);
		await outJson(this.filePath, Object.fromEntries(data.entries()));
	}

	public get size(): number {
		return this.data.size;
	}

	public has(key: string): boolean {
		return this.data.has(key.toString());
	}

	public get(key: string): T | undefined {
		return this.data.get(key.toString());
	}

	public set(key: string, value: T): this {
		this.data.set(key.toString(), value);
		this.changed = true;
		return this;
	}

	public delete(key: string): boolean {
		if (this.data.delete(key.toString())) {
			this.changed = true;
			return true;
		}
		return false;
	}

	public entries() {
		return this.data.entries();
	}

	public keys() {
		return this.data.keys();
	}

	public values() {
		return this.data.values();
	}
}
