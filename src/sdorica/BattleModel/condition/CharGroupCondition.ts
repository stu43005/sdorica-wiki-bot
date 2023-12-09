import { IGroupedCharacter } from "../target/IGroupedCharacter.js";
import { IConditionOfCharacter } from "./IConditionOfCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface CharGroupCondition extends IConditionOfModel {
	group: IGroupedCharacter;
	condition: IConditionOfCharacter;
	everybody: boolean;
}
