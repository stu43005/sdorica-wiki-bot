import { IConditionOfBuff } from "../IConditionOfBuff";
import { IConditionOfCharacter } from "../IConditionOfCharacter";

export interface HasConditionalBuff extends IConditionOfCharacter {
	buffId: string;
	buffCondition: IConditionOfBuff;
}
