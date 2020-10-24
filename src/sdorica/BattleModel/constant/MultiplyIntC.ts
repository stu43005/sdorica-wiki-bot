import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter";

export interface MultiplyIntC extends ISingleIntegerOfCharacter {
	left: ISingleIntegerOfCharacter;
	right: ISingleIntegerOfCharacter;
}
