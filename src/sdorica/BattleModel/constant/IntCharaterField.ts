import { BuffEnums } from "../BuffEnums";
import { ISingleCharacter } from "../target/ISingleCharacter";
import { ISingleInteger } from "./ISingleInteger";

export interface IntCharaterField extends ISingleInteger {
	character: ISingleCharacter;
	targetField: BuffEnums.CharacterIntegerField;
}
