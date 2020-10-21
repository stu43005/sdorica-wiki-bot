import path from "path";
import { DATA_PATH } from "./config";
import { ImperiumData } from "./imperium-data";
import { dataOut, outCsv } from "./out";
import { flipMatrix } from "./utils";

export async function localizationChineseOnly() {
	const chineseFilePath = path.join(DATA_PATH, 'localization-chinese-only.csv');

	const localization = ImperiumData.fromLocalization().getRawData();
	for (const tablename in localization.C) {
		if (localization.C.hasOwnProperty(tablename)) {
			const table = localization.C[tablename];
			if (!table.D) continue;
			let data = flipMatrix(table.D);
			let i = 2;
			while (data[i]) {
				delete data[i];
				i++;
			}
			table.D = flipMatrix(data);
		}
	}

	await outCsv(chineseFilePath, dataOut(localization));

	ImperiumData.fromLocalization().reloadData();
}
