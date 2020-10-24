import { BuffTag } from "../../BuffTag";
import { IConditionOfBuff } from "../IConditionOfBuff";

export interface CheckBuffHasTag extends IConditionOfBuff {
	tag: BuffTag;
}
