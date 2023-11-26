import { Logger } from "./logger";

export abstract class ResourceFile<T> {
	protected logger: Logger;
	protected changed = false;

	private _data: T | null = null;
	protected get data(): T {
		return this._load();
	}
	protected set data(value: T) {
		this._data = value;
		this.changed = true;
	}

	constructor(name: string) {
		this.logger = new Logger(`ResourceFile][${name}`);
		process.on("beforeExit", () => {
			this.cleanup();
		});
	}

	private _load(): T {
		if (this._data === null) {
			this._data = this.loadData();
		}
		return this._data;
	}

	protected abstract loadData(): T;

	protected abstract cleanupData(data: T): Promise<void> | void;

	public async cleanup(): Promise<void> {
		if (this.changed && this._data !== null) {
			this.changed = false;
			try {
				this.logger.info(`Cleaning up...`);
				await this.cleanupData(this._data);
			} catch (error) {
				this.logger.error(`Error occurred while cleanup:`, error);
				debugger;
			}
		}
	}
}
