import { ISingleBuff } from "../buff/single/ISingleBuff.js";
import { BuffEnums } from "../BuffEnums.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface IntBuffField extends ISingleInteger {
	buff: ISingleBuff;
	targetField: BuffEnums.BuffIntergerField;
}
