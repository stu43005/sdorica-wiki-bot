import { BuffEnums } from "../BuffEnums.js";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";

export interface IntFieldB extends ISingleIntegerOfBuff {
	targetField: BuffEnums.BuffIntergerField;
}
