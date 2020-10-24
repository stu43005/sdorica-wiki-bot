import { BuffAction } from "./BuffAction";
import { IConditionOfModel } from "./condition/IConditionOfModel";

export interface BuffSequence {
	Conditions: IConditionOfModel[];
	Actions: BuffAction[];
}
