import { BuffSequence } from "./BuffSequence";
import { IConditionOfModel } from "./condition/IConditionOfModel";

export interface BuffEffect {
	Conditions: IConditionOfModel[];
	Actions: BuffSequence[];
}
