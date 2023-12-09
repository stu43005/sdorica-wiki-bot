import { StoneType } from "../../StoneSystem/StoneType.js";
import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface StoneTypeIs extends IConditionOfCharacter {
	type: StoneType;
}
