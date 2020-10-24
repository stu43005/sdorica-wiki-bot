import { ISingleCharacter } from "../target/ISingleCharacter";
import { IConditionOfCharacter } from "./IConditionOfCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface CharacterCondition extends IConditionOfModel {
	character: ISingleCharacter;
	condition: IConditionOfCharacter;
}
