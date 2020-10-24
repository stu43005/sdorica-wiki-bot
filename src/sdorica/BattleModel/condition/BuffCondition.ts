import { ISingleBuff } from "../buff/single/ISingleBuff";
import { IConditionOfBuff } from "./IConditionOfBuff";
import { IConditionOfModel } from "./IConditionOfModel";

export interface BuffCondition extends IConditionOfModel {
	buff: ISingleBuff;
	condition: IConditionOfBuff;
}
