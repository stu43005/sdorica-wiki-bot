import { IGroupedCharacter } from "../target/IGroupedCharacter";
import { ISingleCharacter } from "../target/ISingleCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface CharacterInside extends IConditionOfModel {
	left: ISingleCharacter;
	group: IGroupedCharacter;
}
