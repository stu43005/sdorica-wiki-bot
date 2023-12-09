import { LevelEventAsset } from "../../sdorica/LevelEventAsset.js";
import { tarnsEvent } from "../leveldata-tarns-event.js";
import { type ViewerJSHelper } from "../viewerjs-helper.js";
import { ImperiumData } from "./$ViewerInit.js";

export default async function (helper: ViewerJSHelper, data: LevelEventAsset) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	data.$interpreted = tarnsEvent(data.Model);
	return data;
}
