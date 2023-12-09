import { IConditionOfBuff } from "../IConditionOfBuff.js";
import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface HasConditionalBuff extends IConditionOfCharacter {
	buffId: string;
	buffCondition: IConditionOfBuff;
}
