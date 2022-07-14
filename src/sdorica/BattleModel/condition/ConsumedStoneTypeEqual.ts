import { StoneType } from "../StoneSystem/StoneType";
import { IConditionOfModel } from "./IConditionOfModel";

export interface ConsumedStoneTypeEqual extends IConditionOfModel {
	Type: StoneType;
}
