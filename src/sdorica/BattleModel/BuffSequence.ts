import { BuffAction } from "./BuffAction.js";
import { IConditionOfModel } from "./condition/IConditionOfModel.js";

export interface BuffSequence {
	Conditions: IConditionOfModel[];
	Actions: BuffAction[];
}
