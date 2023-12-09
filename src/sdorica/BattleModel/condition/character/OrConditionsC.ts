import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface OrConditionsC extends IConditionOfCharacter {
	cond1: IConditionOfCharacter;
	cond2: IConditionOfCharacter;
}
