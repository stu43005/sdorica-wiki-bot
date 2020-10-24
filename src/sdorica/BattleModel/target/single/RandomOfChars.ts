import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface RandomOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
}
