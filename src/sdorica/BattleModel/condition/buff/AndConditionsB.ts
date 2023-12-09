import { IConditionOfBuff } from "../IConditionOfBuff.js";

export interface AndConditionsB extends IConditionOfBuff {
	cond1: IConditionOfBuff;
	cond2: IConditionOfBuff;
}
