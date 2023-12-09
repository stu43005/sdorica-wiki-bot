import { ISingleInteger } from "../constant/ISingleInteger.js";
import { IConditionOfModel } from "./IConditionOfModel.js";
import { NumericCompareOperator } from "./NumericCompareOperator.js";

export interface IntCompare extends IConditionOfModel {
	left: ISingleInteger;
	op: NumericCompareOperator;
	right: ISingleInteger;
}
