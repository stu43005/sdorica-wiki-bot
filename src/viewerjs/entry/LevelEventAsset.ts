import { LevelEventAsset } from "../../sdorica/LevelEventAsset";
import { tarnsEvent } from "../leveldata-tarns-event";
import { ViewerJSHelper } from "../viewerjs-helper";
import { ImperiumData } from "./$ViewerInit";

export default async function (helper: ViewerJSHelper, data: LevelEventAsset) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	data.$interpreted = tarnsEvent(data.Model);
	return data;
}
