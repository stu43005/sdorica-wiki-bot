import { BuffLabelData } from "../../BuffLabelData.js";
import { IConditionOfBuff } from "../IConditionOfBuff.js";

export interface CheckBuffBelongLabel extends IConditionOfBuff {
	BuffLabel: BuffLabelData;
}
