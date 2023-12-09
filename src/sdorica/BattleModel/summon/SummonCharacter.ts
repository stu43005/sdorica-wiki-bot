import { ISummonSingleCharacter } from "./ISummonSingleCharacter.js";
import { SummonCharacterArg } from "./SummonCharacterArg.js";

export interface SummonCharacter extends ISummonSingleCharacter {
	CharacterArg: SummonCharacterArg;
}
