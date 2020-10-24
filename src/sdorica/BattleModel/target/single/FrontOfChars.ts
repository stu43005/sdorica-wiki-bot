import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface FrontOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
}
