import path from "path";
import { DATA_PATH } from "./config";
import { gamedataTeanslateSettings } from "./gamedata-translate-settings";
import { ImperiumData } from "./imperium-data";
import { Logger } from './logger';
import { dataOut, outCsv, outXlsx } from "./out";

const logger = new Logger('gamedata-translate');

export function doGamedataTranslation() {
	gamedataTeanslateSettings.forEach((ref) => {
		const table = ImperiumData.fromGamedata().getTable(ref.table);
		if (!table) {
			logger.debug(ref);
			debugger;
			return;
		}
		for (let i = 0; i < table.length; i++) {
			const row = table.get(i);
			const columns = ref.column.split(",");
			columns.forEach(col => {
				const subcols = col.split(":");
				const data = subcols.map(c => row.get(c)).join(":");
				const result = ref.func.call(row, data);
				if (result) {
					row.set(subcols[0], `${row.get(subcols[0])} (${result})`);
				}
			});
		}
	});
}

export function cleanupGamedataTranslation() {
	ImperiumData.fromGamedata().reloadData();
}

export async function gamedataTranslate() {
	const filename = 'gamedata-translated';
	const csvFilePath = path.join(DATA_PATH, `${filename}.csv`);
	const xlsxFilePath = path.join(DATA_PATH, `${filename}.xlsx`);

	doGamedataTranslation();

	const gamedata = ImperiumData.fromGamedata().getRawData();
	await outCsv(csvFilePath, dataOut(gamedata));
	await outXlsx(xlsxFilePath, gamedata);

	cleanupGamedataTranslation();
}
