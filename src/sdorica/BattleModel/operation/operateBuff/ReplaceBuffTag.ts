import { BuffTag } from "../../BuffTag.js";
import { IOperationToBuff } from "./IOperationToBuff.js";

export interface ReplaceBuffTag extends IOperationToBuff {
	newTag: BuffTag;
}
