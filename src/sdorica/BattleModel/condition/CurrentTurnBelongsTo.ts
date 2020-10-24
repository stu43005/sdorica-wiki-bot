import { ISingleCharacter } from "../target/ISingleCharacter";
import { IConditionOfModel } from "./IConditionOfModel";

export interface CurrentTurnBelongsTo extends IConditionOfModel {
	character: ISingleCharacter;
}
