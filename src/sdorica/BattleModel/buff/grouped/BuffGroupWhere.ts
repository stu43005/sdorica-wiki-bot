import { IConditionOfBuff } from "../../condition/IConditionOfBuff.js";
import { IGroupedBuff } from "./IGroupedBuff.js";

export interface BuffGroupWhere extends IGroupedBuff {
	group: IGroupedBuff;
	condition: IConditionOfBuff;
}
