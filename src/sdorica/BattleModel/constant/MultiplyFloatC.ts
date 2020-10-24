import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter";

export interface MultiplyFloatC extends ISingleIntegerOfCharacter {
	left: ISingleIntegerOfCharacter;
	ratio: number;
}
