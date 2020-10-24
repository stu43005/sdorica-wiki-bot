import { ISingleBuff } from "../buff/single/ISingleBuff";
import { IConditionOfModel } from "./IConditionOfModel";

export interface BuffEqual extends IConditionOfModel {
	left: ISingleBuff;
	right: ISingleBuff;
}
