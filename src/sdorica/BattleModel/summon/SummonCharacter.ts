import { ISummonSingleCharacter } from "./ISummonSingleCharacter";
import { SummonCharacterArg } from "./SummonCharacterArg";

export interface SummonCharacter extends ISummonSingleCharacter {
	CharacterArg: SummonCharacterArg;
}
