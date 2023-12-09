import { doGamedataTranslation } from "../../gamedata-translate-settings.js";
import { tableOut } from "../../out-data.js";
import { objectEach } from "../../utils.js";
import { type ViewerJSHelper } from "../viewerjs-helper.js";
import { getImperiumName, ImperiumData } from "./$ViewerInit.js";

export default async function (helper: ViewerJSHelper) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	const out: Record<string, any> = {
		"!! Imperium version !!": `\n${await getImperiumName(
			helper,
			"localization",
		)}\n${await getImperiumName(helper, "gamedata")}`,
	};

	const gamedata = doGamedataTranslation().getRawData();
	objectEach(gamedata.C, (tablename, table) => {
		out[tablename] = out[tablename] || [];
		tableOut(out[tablename], tablename, table);
		out[tablename] = out[tablename].map((a: any) => a.toString && a.toString());
	});
	return out;
}
