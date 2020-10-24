import { IConditionOfModel } from "../../condition/IConditionOfModel";
import { IGroupedCharacter } from "../IGroupedCharacter";

export interface CharGroupWhereM extends IGroupedCharacter {
	group: IGroupedCharacter;
	condition: IConditionOfModel;
}
