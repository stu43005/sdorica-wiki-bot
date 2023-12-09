import { IConditionOfCharacter } from "../../condition/IConditionOfCharacter.js";
import { IGroupedCharacter } from "../IGroupedCharacter.js";

export interface CharGroupWhere extends IGroupedCharacter {
	group: IGroupedCharacter;
	condition: IConditionOfCharacter;
}
