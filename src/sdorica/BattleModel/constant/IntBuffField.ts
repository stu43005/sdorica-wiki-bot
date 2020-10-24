import { ISingleBuff } from "../buff/single/ISingleBuff";
import { BuffEnums } from "../BuffEnums";
import { ISingleInteger } from "./ISingleInteger";

export interface IntBuffField extends ISingleInteger {
	buff: ISingleBuff;
	targetField: BuffEnums.BuffIntergerField;
}
