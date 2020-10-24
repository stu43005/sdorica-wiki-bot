import { BuffEnums } from "../BuffEnums";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter";

export interface IntFieldC extends ISingleIntegerOfCharacter {
	targetField: BuffEnums.CharacterIntegerField;
}
