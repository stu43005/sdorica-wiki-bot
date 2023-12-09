import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface CharacterHasBuff extends IConditionOfModel {
	character: ISingleCharacter;
	buffId: string;
}
