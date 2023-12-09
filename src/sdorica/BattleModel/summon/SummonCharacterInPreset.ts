import { ISummonSingleCharacter } from "./ISummonSingleCharacter.js";
import { WeightedSummonCharacterArg } from "./WeightedSummonCharacterArg.js";

export interface SummonCharacterInPreset extends ISummonSingleCharacter {
	WeightedCharacterArgs: WeightedSummonCharacterArg[];
}
