import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface HasBuff extends IConditionOfCharacter {
	buffId: string;
}
