import { IConditionOfBuff } from "./IConditionOfBuff";
import { IConditionOfCharacter } from "./IConditionOfCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface RandomCondition extends IConditionOfModel, IConditionOfBuff, IConditionOfCharacter {
	randBase: number;
	lessThan: number;
}
