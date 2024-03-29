import { type ViewerJSHelper } from "../viewerjs-helper.js";
import { getHeroJsonData, getImperiumName, ImperiumData } from "./$ViewerInit.js";

export default async function (helper: ViewerJSHelper) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	const heroJson = getHeroJsonData();
	const out = {
		"!! Imperium version !!": `\n${await getImperiumName(
			helper,
			"localization",
		)}\n${await getImperiumName(helper, "gamedata")}`,
	};
	Object.assign(out, heroJson);
	return out;
}
