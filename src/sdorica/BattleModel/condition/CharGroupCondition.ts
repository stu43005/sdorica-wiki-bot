import { IGroupedCharacter } from "../target/IGroupedCharacter";
import { IConditionOfCharacter } from "./IConditionOfCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface CharGroupCondition extends IConditionOfModel {
	group: IGroupedCharacter;
	condition: IConditionOfCharacter;
	everybody: boolean;
}
