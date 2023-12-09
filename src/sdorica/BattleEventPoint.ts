import { IConditionOfModel } from "./BattleModel/condition/IConditionOfModel.js";
import { LevelEvent } from "./LevelEvent.js";
import { WaveName } from "./WaveName.js";

export interface BattleEventPoint extends LevelEvent {
	useBattleAudio: boolean;
	_GroupName: WaveName;
	endCondition: IConditionOfModel;
	_failCondition: IConditionOfModel;
}
