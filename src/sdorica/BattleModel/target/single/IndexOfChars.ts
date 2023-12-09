import { ISingleInteger } from "../../constant/ISingleInteger.js";
import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface IndexOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
	index: ISingleInteger;
	backward: boolean;
}
