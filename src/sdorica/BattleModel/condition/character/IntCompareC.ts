import { ISingleIntegerOfCharacter } from "../../constant/ISingleIntegerOfCharacter.js";
import { IConditionOfCharacter } from "../IConditionOfCharacter.js";
import { NumericCompareOperator } from "../NumericCompareOperator.js";

export interface IntCompareC extends IConditionOfCharacter {
	left: ISingleIntegerOfCharacter;
	op: NumericCompareOperator;
	right: ISingleIntegerOfCharacter;
}
