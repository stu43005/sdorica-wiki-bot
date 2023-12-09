import { IConditionOfModel } from "../condition/IConditionOfModel.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface ConditionalInteger extends ISingleInteger {
	Condition: IConditionOfModel;
	NotPassValue: ISingleInteger;
	PassValue: ISingleInteger;
}
