import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";

export interface MultiplyIntC extends ISingleIntegerOfCharacter {
	left: ISingleIntegerOfCharacter;
	right: ISingleIntegerOfCharacter;
}
