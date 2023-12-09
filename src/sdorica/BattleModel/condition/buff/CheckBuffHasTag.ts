import { BuffTag } from "../../BuffTag.js";
import { IConditionOfBuff } from "../IConditionOfBuff.js";

export interface CheckBuffHasTag extends IConditionOfBuff {
	tag: BuffTag;
}
