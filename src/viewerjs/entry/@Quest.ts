import { ViewerJSHelper } from '../viewerjs-helper';
import { getImperiumName, getQuestJsonData, ImperiumData } from './$ViewerInit';

export default async function (helper: ViewerJSHelper) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	const questJson = getQuestJsonData();
	const out = {
		"!! Imperium version !!": `\n${await getImperiumName(helper, "localization")}\n${await getImperiumName(helper, "gamedata")}`,
	};
	Object.assign(out, questJson);
	return out;
}
