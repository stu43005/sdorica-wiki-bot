import { ISingleInteger } from "./ISingleInteger";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter";

export interface ConstanctInt
	extends ISingleInteger,
		ISingleIntegerOfBuff,
		ISingleIntegerOfCharacter {
	constant: number;
}
