import { IConditionOfBuff } from "../IConditionOfBuff";

export interface AndConditionsB extends IConditionOfBuff {
	cond1: IConditionOfBuff;
	cond2: IConditionOfBuff;
}
