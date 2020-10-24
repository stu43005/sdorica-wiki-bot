import { IGroupedBuff } from "../../buff/grouped/IGroupedBuff";
import { BuffEnums } from "../../BuffEnums";
import { IGroupedInteger } from "./IGroupedInteger";

export interface IntsOnBuffGroup extends IGroupedInteger {
	group: IGroupedBuff;
	targetField: BuffEnums.BuffIntergerField;
}
