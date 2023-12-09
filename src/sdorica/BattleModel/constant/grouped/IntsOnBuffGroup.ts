import { IGroupedBuff } from "../../buff/grouped/IGroupedBuff.js";
import { BuffEnums } from "../../BuffEnums.js";
import { IGroupedInteger } from "./IGroupedInteger.js";

export interface IntsOnBuffGroup extends IGroupedInteger {
	group: IGroupedBuff;
	targetField: BuffEnums.BuffIntergerField;
}
