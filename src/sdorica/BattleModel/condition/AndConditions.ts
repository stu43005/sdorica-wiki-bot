import { IConditionOfModel } from "./IConditionOfModel.js";

export interface AndConditions extends IConditionOfModel {
	cond1: IConditionOfModel;
	cond2: IConditionOfModel;
}
