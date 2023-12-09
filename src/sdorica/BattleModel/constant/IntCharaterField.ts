import { BuffEnums } from "../BuffEnums.js";
import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface IntCharaterField extends ISingleInteger {
	character: ISingleCharacter;
	targetField: BuffEnums.CharacterIntegerField;
}
