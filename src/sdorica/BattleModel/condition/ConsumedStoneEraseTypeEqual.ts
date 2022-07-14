import { StoneEraseType } from "../StoneSystem/StoneEraseType";
import { IConditionOfModel } from "./IConditionOfModel";

export interface ConsumedStoneEraseTypeEqual extends IConditionOfModel {
	EraseType: StoneEraseType;
}
