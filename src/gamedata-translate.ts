import path from "node:path";
import { DATA_PATH } from "./config.js";
import { doGamedataTranslation } from "./gamedata-translate-settings.js";
import { outCsv, outXlsx } from "./out.js";
import { dataOut } from "./out-data.js";

export async function gamedataTranslate() {
	const filename = "gamedata-translated";
	const csvFilePath = path.join(DATA_PATH, `${filename}.csv`);
	const xlsxFilePath = path.join(DATA_PATH, `${filename}.xlsx`);

	const gamedata = doGamedataTranslation().getRawData();
	await outCsv(csvFilePath, dataOut(gamedata));
	await outXlsx(xlsxFilePath, gamedata);
}
