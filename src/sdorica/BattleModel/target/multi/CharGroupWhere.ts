import { IConditionOfCharacter } from "../../condition/IConditionOfCharacter";
import { IGroupedCharacter } from "../IGroupedCharacter";

export interface CharGroupWhere extends IGroupedCharacter {
	group: IGroupedCharacter;
	condition: IConditionOfCharacter;
}
