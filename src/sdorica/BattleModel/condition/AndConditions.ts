import { IConditionOfModel } from "./IConditionOfModel";

export interface AndConditions extends IConditionOfModel {
	cond1: IConditionOfModel;
	cond2: IConditionOfModel;
}
