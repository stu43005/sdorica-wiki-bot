import { ISingleCharacter } from "../target/ISingleCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface CharacterEqual extends IConditionOfModel {
	left: ISingleCharacter;
	right: ISingleCharacter;
}
