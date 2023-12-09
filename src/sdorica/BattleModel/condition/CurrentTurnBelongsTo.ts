import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface CurrentTurnBelongsTo extends IConditionOfModel {
	character: ISingleCharacter;
}
