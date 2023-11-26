import path from "node:path";
import { inputJsonSync } from "./input";
import { outJson } from "./out";
import { ResourceFile } from "./out-resource-file";

export class SetFile<T> extends ResourceFile<Set<T>> {
	constructor(private filePath: string) {
		super(path.basename(filePath));
	}

	protected loadData(): Set<T> {
		try {
			return new Set(inputJsonSync<T[]>(this.filePath));
		} catch (error) {}
		return new Set();
	}

	protected async cleanupData(data: Set<T>): Promise<void> {
		this.logger.info(`Saving file...: ${this.filePath}`);
		await outJson(this.filePath, Array.from(data).sort());
	}

	public has(str: T): boolean {
		return this.data.has(str);
	}

	public add(str: T): boolean {
		if (!this.data.has(str)) {
			this.data.add(str);
			this.changed = true;
			return true;
		}
		return false;
	}

	public delete(str: T): boolean {
		if (this.data.delete(str)) {
			this.changed = true;
			return true;
		}
		return false;
	}

	public values() {
		return this.data.values();
	}
}
