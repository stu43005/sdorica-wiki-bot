import { BuffTag } from "../../BuffTag";
import { IOperationToBuff } from "./IOperationToBuff";

export interface ReplaceBuffTag extends IOperationToBuff {
	newTag: BuffTag;
}
