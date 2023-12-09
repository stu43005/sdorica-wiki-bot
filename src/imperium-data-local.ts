import path from "node:path";
import { GAMEDATA_PATH } from "./config.js";
import { ImperiumDataRaw } from "./data-raw-type.js";
import { ImperiumData } from "./imperium-data.js";
import { inputJsonSync } from "./input.js";
import { Logger } from "./logger.js";
import { fsExists } from "./out.js";

const logger = new Logger("imperium-data");

export function registerImperiumLocalLoader() {
	ImperiumData.dataLoader = (self) => {
		const jsonFilePath = path.join(GAMEDATA_PATH, `${self.name}.json`);
		if (!fsExists(jsonFilePath)) {
			logger.error(`Not exists: "${jsonFilePath}"`);
			debugger;
			throw new Error(`Not exists: "${jsonFilePath}"`);
		}
		const raw = inputJsonSync<ImperiumDataRaw>(jsonFilePath);
		self.data = raw;
	};
}
registerImperiumLocalLoader();
