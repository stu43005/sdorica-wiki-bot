import { ISummonSingleCharacter } from "./ISummonSingleCharacter";
import { WeightedSummonCharacterArg } from "./WeightedSummonCharacterArg";

export interface SummonCharacterInPreset extends ISummonSingleCharacter {
	WeightedCharacterArgs: WeightedSummonCharacterArg[];
}
