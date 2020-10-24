import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter";

export interface PlusIntC extends ISingleIntegerOfCharacter {
	left: ISingleIntegerOfCharacter;
	right: ISingleIntegerOfCharacter;
}
