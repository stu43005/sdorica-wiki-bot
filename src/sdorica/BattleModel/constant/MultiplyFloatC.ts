import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";

export interface MultiplyFloatC extends ISingleIntegerOfCharacter {
	left: ISingleIntegerOfCharacter;
	ratio: number;
}
