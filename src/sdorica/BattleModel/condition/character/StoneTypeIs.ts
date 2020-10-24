import { StoneType } from "../../StoneSystem/StoneType";
import { IConditionOfCharacter } from "../IConditionOfCharacter";

export interface StoneTypeIs extends IConditionOfCharacter {
	type: StoneType;
}
