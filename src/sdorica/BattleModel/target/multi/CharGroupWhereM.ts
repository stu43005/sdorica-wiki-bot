import { IConditionOfModel } from "../../condition/IConditionOfModel.js";
import { IGroupedCharacter } from "../IGroupedCharacter.js";

export interface CharGroupWhereM extends IGroupedCharacter {
	group: IGroupedCharacter;
	condition: IConditionOfModel;
}
