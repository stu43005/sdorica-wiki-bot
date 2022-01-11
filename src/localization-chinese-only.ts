import path from "path";
import { DATA_PATH } from "./config";
import { ImperiumData } from "./imperium-data";
import { outCsv } from "./out";
import { dataOut } from "./out-data";
import { sortKeyByTable } from "./out-sort-key";
import { flipMatrix } from "./utils";

export async function localizationChineseOnly() {
	const chineseFilePath = path.join(DATA_PATH, 'localization-chinese-only.csv');

	const localization = ImperiumData.fromLocalization().getRawData();
	for (const tablename in localization.C) {
		if (localization.C.hasOwnProperty(tablename)) {
			const table = localization.C[tablename];
			if (!table.D) continue;
			table.D.push(table.T);
			table.D.push(table.K);
			const data = flipMatrix(table.D)
				.filter((value: any[]) => ['Key', 'Chinese'].indexOf('' + value[value.length - 1]) != -1)
				.sort(sortKeyByTable(tablename));
			const edited = flipMatrix(data);
			table.K = edited.pop() || [];
			table.T = edited.pop() || [];
			table.D = edited;
		}
	}

	await outCsv(chineseFilePath, dataOut(localization));

	await ImperiumData.fromLocalization().reloadData();
}
