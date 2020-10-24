import { IConditionOfCharacter } from "../IConditionOfCharacter";

export interface HasBuff extends IConditionOfCharacter {
	buffId: string;
}
