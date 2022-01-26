import path from "path";
import { DATA_PATH } from "./config";
import { doGamedataTranslation } from "./gamedata-translate-settings";
import { outCsv, outXlsx } from "./out";
import { dataOut } from "./out-data";

export async function gamedataTranslate() {
	const filename = 'gamedata-translated';
	const csvFilePath = path.join(DATA_PATH, `${filename}.csv`);
	const xlsxFilePath = path.join(DATA_PATH, `${filename}.xlsx`);

	const gamedata = doGamedataTranslation().getRawData();
	await outCsv(csvFilePath, dataOut(gamedata));
	await outXlsx(xlsxFilePath, gamedata);
}
