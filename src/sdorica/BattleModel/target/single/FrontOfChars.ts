import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface FrontOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
}
