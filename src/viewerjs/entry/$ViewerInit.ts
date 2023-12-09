import { ImperiumData } from "../../imperium-data.js";
import { Logger } from "../../logger.js";
import { registerImperiumDataViewerJS } from "../imperium-data-viewerjs.js";
import { type ViewerJSHelper } from "../viewerjs-helper.js";

export * from "../../imperium-data.js";
export * from "../../lib/FullSerializer/fsSerializer.js";
export * from "../../sdorica/BattleModel/condition/ConditionStringify.js";
export * from "../../sdorica/BattleModel/operation/OperationStringify.js";
export * from "../../sdorica/BattleModel/skilleffect/SkillEffectStringify.js";
export * from "../../sdorica/BattleModel/SkillUnit.js";
export * from "../../sdorica/BattleModel/StoneSystem/StoneEraseType.js";
export * from "../../sdorica/BattleModel/target/TargetStringify.js";
export * from "../../wiki-hero.js";
export * from "../../wiki-item.js";
export * from "../../wiki-quest.js";
export * from "../utils.js";

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
