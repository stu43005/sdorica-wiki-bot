import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface BackOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
}
