import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface CharacterEqual extends IConditionOfModel {
	left: ISingleCharacter;
	right: ISingleCharacter;
}
