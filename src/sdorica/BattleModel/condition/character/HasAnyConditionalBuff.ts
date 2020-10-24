import { IConditionOfBuff } from "../IConditionOfBuff";
import { IConditionOfCharacter } from "../IConditionOfCharacter";

export interface HasAnyConditionalBuff extends IConditionOfCharacter {
	buffCondition: IConditionOfBuff;
}
