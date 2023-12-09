import { IGroupedCharacter } from "../target/IGroupedCharacter.js";
import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface CharacterInside extends IConditionOfModel {
	left: ISingleCharacter;
	group: IGroupedCharacter;
}
