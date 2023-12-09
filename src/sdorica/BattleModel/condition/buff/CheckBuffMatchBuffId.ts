import { IConditionOfBuff } from "../IConditionOfBuff.js";

export interface CheckBuffMatchBuffId extends IConditionOfBuff {
	subString: string;
}
