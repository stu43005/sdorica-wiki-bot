import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";

export interface PlusIntC extends ISingleIntegerOfCharacter {
	left: ISingleIntegerOfCharacter;
	right: ISingleIntegerOfCharacter;
}
