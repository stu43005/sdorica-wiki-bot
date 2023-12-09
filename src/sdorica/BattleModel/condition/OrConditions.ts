import { IConditionOfModel } from "./IConditionOfModel.js";

export interface OrConditions extends IConditionOfModel {
	cond1: IConditionOfModel;
	cond2: IConditionOfModel;
}
