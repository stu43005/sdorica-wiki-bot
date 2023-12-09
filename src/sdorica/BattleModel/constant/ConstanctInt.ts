import { ISingleInteger } from "./ISingleInteger.js";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";

export interface ConstanctInt
	extends ISingleInteger,
		ISingleIntegerOfBuff,
		ISingleIntegerOfCharacter {
	constant: number;
}
