import { IConditionOfBuff } from "../../condition/IConditionOfBuff";
import { IGroupedBuff } from "./IGroupedBuff";

export interface BuffGroupWhere extends IGroupedBuff {
	group: IGroupedBuff;
	condition: IConditionOfBuff;
}
