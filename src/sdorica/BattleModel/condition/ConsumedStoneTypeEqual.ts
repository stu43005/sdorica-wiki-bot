import { StoneType } from "../StoneSystem/StoneType.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface ConsumedStoneTypeEqual extends IConditionOfModel {
	Type: StoneType;
}
