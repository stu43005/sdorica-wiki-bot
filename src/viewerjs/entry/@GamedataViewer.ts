import { doGamedataTranslation } from '../../gamedata-translate-settings';
import { tableOut } from '../../out-data';
import { objectEach } from '../../utils';
import { ViewerJSHelper } from '../viewerjs-helper';
import { getImperiumName, ImperiumData } from './$ViewerInit';

export default async function (helper: ViewerJSHelper) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	const out: Record<string, any> = {
		"!! Imperium version !!": `\n${await getImperiumName(helper, "localization")}\n${await getImperiumName(helper, "gamedata")}`,
	};

	const gamedata = doGamedataTranslation().getRawData();
	objectEach(gamedata.C, (tablename, table) => {
		out[tablename] = out[tablename] || [];
		tableOut(out[tablename], tablename, table);
		out[tablename] = out[tablename].map((a: any) => a.toString && a.toString());
	});
	return out;
}
