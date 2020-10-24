import { IConditionOfModel } from "./IConditionOfModel";

export interface Inverse extends IConditionOfModel {
	condition: IConditionOfModel;
}
