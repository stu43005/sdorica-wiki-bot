import path from "path";
import { GAMEDATA_PATH } from "./config";
import { ImperiumDataRaw } from "./data-raw-type";
import { ImperiumData } from "./imperium-data";
import { inputJsonSync } from "./input";
import { Logger } from "./logger";
import { fsExists } from "./out";

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
