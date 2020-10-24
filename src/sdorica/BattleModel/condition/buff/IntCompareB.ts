import { ISingleIntegerOfBuff } from "../../constant/ISingleIntegerOfBuff";
import { IConditionOfBuff } from "../IConditionOfBuff";
import { NumericCompareOperator } from "../NumericCompareOperator";

export interface IntCompareB extends IConditionOfBuff {
	left: ISingleIntegerOfBuff;
	op: NumericCompareOperator;
	right: ISingleIntegerOfBuff;
}
