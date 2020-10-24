import { BuffEnums } from "../BuffEnums";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff";

export interface IntFieldB extends ISingleIntegerOfBuff {
	targetField: BuffEnums.BuffIntergerField;
}
