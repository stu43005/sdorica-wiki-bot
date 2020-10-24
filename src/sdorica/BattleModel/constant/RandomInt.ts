import { ISingleInteger } from "./ISingleInteger";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter";

export interface RandomInt extends ISingleInteger, ISingleIntegerOfBuff, ISingleIntegerOfCharacter {
	randMax: number;
}
