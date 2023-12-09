import { BuffSequence } from "./BuffSequence.js";
import { IConditionOfModel } from "./condition/IConditionOfModel.js";

export interface BuffEffect {
	Conditions: IConditionOfModel[];
	Actions: BuffSequence[];
}
