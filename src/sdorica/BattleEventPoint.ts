import { IConditionOfModel } from "./BattleModel/condition/IConditionOfModel";
import { LevelEvent } from "./LevelEvent";
import { WaveName } from "./WaveName";

export interface BattleEventPoint extends LevelEvent {
	useBattleAudio: boolean;
	_GroupName: WaveName;
	endCondition: IConditionOfModel;
	_failCondition: IConditionOfModel;
}
