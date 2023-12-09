import { ISingleIntegerOfBuff } from "../../constant/ISingleIntegerOfBuff.js";
import { IConditionOfBuff } from "../IConditionOfBuff.js";
import { NumericCompareOperator } from "../NumericCompareOperator.js";

export interface IntCompareB extends IConditionOfBuff {
	left: ISingleIntegerOfBuff;
	op: NumericCompareOperator;
	right: ISingleIntegerOfBuff;
}
