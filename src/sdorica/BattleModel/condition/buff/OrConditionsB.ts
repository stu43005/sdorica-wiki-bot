import { IConditionOfBuff } from "../IConditionOfBuff";

export interface OrConditionsB extends IConditionOfBuff {
	cond1: IConditionOfBuff;
	cond2: IConditionOfBuff;
}
