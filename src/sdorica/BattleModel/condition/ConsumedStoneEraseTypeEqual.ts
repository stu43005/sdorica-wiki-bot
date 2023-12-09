import { StoneEraseType } from "../StoneSystem/StoneEraseType.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface ConsumedStoneEraseTypeEqual extends IConditionOfModel {
	EraseType: StoneEraseType;
}
