import { BuffLabelData } from "../../BuffLabelData";
import { IConditionOfBuff } from "../IConditionOfBuff";

export interface CheckBuffBelongLabel extends IConditionOfBuff {
	BuffLabel: BuffLabelData;
}
