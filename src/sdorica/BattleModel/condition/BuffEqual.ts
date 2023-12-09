import { ISingleBuff } from "../buff/single/ISingleBuff.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface BuffEqual extends IConditionOfModel {
	left: ISingleBuff;
	right: ISingleBuff;
}
