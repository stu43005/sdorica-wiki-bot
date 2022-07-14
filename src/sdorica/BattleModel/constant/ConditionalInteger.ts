import { IConditionOfModel } from "../condition/IConditionOfModel";
import { ISingleInteger } from "./ISingleInteger";

export interface ConditionalInteger extends ISingleInteger {
	Condition: IConditionOfModel;
	NotPassValue: ISingleInteger;
	PassValue: ISingleInteger;
}
