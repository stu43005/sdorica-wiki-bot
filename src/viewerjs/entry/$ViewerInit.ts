import { ImperiumData } from "../../imperium-data";
import { Logger } from "../../logger";
import { registerImperiumDataViewerJS } from "../imperium-data-viewerjs";
import { ViewerJSHelper } from "../viewerjs-helper";

export * from "../../imperium-data";
export * from "../../lib/FullSerializer/fsSerializer";
export * from "../../sdorica/BattleModel/condition/ConditionStringify";
export * from "../../sdorica/BattleModel/operation/OperationStringify";
export * from "../../sdorica/BattleModel/skilleffect/SkillEffectStringify";
export * from "../../sdorica/BattleModel/SkillUnit";
export * from "../../sdorica/BattleModel/StoneSystem/StoneEraseType";
export * from "../../sdorica/BattleModel/target/TargetStringify";
export * from "../../wiki-hero";
export * from "../../wiki-item";
export * from "../../wiki-quest";
export * from "../utils";

const logger = new Logger("$ViewerInit");

export default function (helper: ViewerJSHelper) {
	logger.log("before $ViewerInit");

	// create instance first
	ImperiumData.fromGamedata();
	ImperiumData.fromLocalization();
	ImperiumData.fromCharAssets();
	// register loader
	registerImperiumDataViewerJS(helper);

	logger.log("after $ViewerInit");
}
