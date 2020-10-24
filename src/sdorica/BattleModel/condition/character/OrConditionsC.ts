import { IConditionOfCharacter } from "../IConditionOfCharacter";

export interface OrConditionsC extends IConditionOfCharacter {
	cond1: IConditionOfCharacter;
	cond2: IConditionOfCharacter;
}
