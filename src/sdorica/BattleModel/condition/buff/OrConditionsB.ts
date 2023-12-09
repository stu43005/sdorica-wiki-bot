import { IConditionOfBuff } from "../IConditionOfBuff.js";

export interface OrConditionsB extends IConditionOfBuff {
	cond1: IConditionOfBuff;
	cond2: IConditionOfBuff;
}
