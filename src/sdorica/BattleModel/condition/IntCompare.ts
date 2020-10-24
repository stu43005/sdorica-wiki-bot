import { ISingleInteger } from "../constant/ISingleInteger";
import { IConditionOfModel } from "./IConditionOfModel";
import { NumericCompareOperator } from "./NumericCompareOperator";

export interface IntCompare extends IConditionOfModel {
	left: ISingleInteger;
	op: NumericCompareOperator;
	right: ISingleInteger;
}
