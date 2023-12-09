import { isDevMode } from "./utils.js";

export class Logger {
	constructor(private context: string) {}

	public get info() {
		return this.log.bind(this);
	}
	public async log(...msgs: any[]) {
		console.log("ℹ️", `[${this.context}]`, ...msgs);
	}

	public async debug(...msgs: any[]) {
		if (isDevMode()) {
			console.debug("🐛", `[${this.context}]`, ...msgs);
		}
	}

	public async warn(...msgs: any[]) {
		console.warn("⚠️", `[${this.context}]`, ...msgs);
	}

	public async error(...msgs: any[]) {
		console.error("❌", `[${this.context}]`, ...msgs);
	}
}
