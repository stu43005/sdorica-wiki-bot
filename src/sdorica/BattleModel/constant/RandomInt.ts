import { ISingleInteger } from "./ISingleInteger.js";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";

export interface RandomInt extends ISingleInteger, ISingleIntegerOfBuff, ISingleIntegerOfCharacter {
	randMax: number;
}
