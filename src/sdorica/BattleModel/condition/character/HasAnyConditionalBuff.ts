import { IConditionOfBuff } from "../IConditionOfBuff.js";
import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface HasAnyConditionalBuff extends IConditionOfCharacter {
	buffCondition: IConditionOfBuff;
}
