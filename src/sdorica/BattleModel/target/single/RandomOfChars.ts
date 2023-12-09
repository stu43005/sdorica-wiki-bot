import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface RandomOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
}
