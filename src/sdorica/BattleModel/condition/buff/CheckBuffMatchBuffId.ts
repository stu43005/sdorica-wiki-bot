import { IConditionOfBuff } from "../IConditionOfBuff";

export interface CheckBuffMatchBuffId extends IConditionOfBuff {
	subString: string;
}
