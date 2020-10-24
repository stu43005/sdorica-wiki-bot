import { IConditionOfModel } from "./IConditionOfModel";

export interface OrConditions extends IConditionOfModel {
	cond1: IConditionOfModel;
	cond2: IConditionOfModel;
}
