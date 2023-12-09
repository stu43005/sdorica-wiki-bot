import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IConditionOfCharacter } from "./IConditionOfCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface CharacterCondition extends IConditionOfModel {
	character: ISingleCharacter;
	condition: IConditionOfCharacter;
}
