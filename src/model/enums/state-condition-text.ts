import { localizationQuestName, localizationVolumeNameById } from "../../localization.js";
import { StateCondition } from "./state-condition.enum.js";

export function stateConditionText(cond: StateCondition, param1: string): string {
	switch (cond) {
		case StateCondition.PlayerLevel:
			return `諦視者等級 ${param1}`;
		case StateCondition.QuestComplete:
			return `通過關卡 ${localizationQuestName()(param1)}`;
		case StateCondition.VolumeExist:
			return `已開啟卷 ${localizationVolumeNameById()(param1)}`;
		case StateCondition.FlagCondition:
			return `Flag: ${param1}`;
	}
	console.log(`unknown state condition: ${cond}:${param1}`);
	debugger;
	return `${cond}:${param1}`;
}
