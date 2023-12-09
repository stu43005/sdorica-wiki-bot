import { ISingleBuff } from "../buff/single/ISingleBuff.js";
import { IConditionOfBuff } from "./IConditionOfBuff.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface BuffCondition extends IConditionOfModel {
	buff: ISingleBuff;
	condition: IConditionOfBuff;
}
