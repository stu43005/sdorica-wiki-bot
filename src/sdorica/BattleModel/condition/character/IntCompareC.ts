import { ISingleIntegerOfCharacter } from "../../constant/ISingleIntegerOfCharacter";
import { IConditionOfCharacter } from "../IConditionOfCharacter";
import { NumericCompareOperator } from "../NumericCompareOperator";

export interface IntCompareC extends IConditionOfCharacter {
	left: ISingleIntegerOfCharacter;
	op: NumericCompareOperator;
	right: ISingleIntegerOfCharacter;
}
