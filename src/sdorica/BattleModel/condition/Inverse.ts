import { IConditionOfModel } from "./IConditionOfModel.js";

export interface Inverse extends IConditionOfModel {
	condition: IConditionOfModel;
}
