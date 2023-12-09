import { BuffEnums } from "../BuffEnums.js";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";

export interface IntFieldC extends ISingleIntegerOfCharacter {
	targetField: BuffEnums.CharacterIntegerField;
}
