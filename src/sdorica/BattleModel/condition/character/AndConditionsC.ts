import { IConditionOfCharacter } from "../IConditionOfCharacter";

export interface AndConditionsC extends IConditionOfCharacter {
	cond1: IConditionOfCharacter;
	cond2: IConditionOfCharacter;
}
