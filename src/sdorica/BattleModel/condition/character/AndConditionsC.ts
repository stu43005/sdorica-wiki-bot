import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface AndConditionsC extends IConditionOfCharacter {
	cond1: IConditionOfCharacter;
	cond2: IConditionOfCharacter;
}
