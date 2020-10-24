import { ISingleCharacter } from "../target/ISingleCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface CharacterHasBuff extends IConditionOfModel {
	character: ISingleCharacter;
	buffId: string;
}
