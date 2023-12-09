import { IConditionOfBuff } from "./IConditionOfBuff.js";
import { IConditionOfCharacter } from "./IConditionOfCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface RandomCondition
	extends IConditionOfModel,
		IConditionOfBuff,
		IConditionOfCharacter {
	randBase: number;
	lessThan: number;
}
