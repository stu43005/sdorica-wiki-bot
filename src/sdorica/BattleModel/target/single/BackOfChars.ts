import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface BackOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
}
