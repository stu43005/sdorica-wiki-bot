import { ISingleInteger } from "../../constant/ISingleInteger";
import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface IndexOfChars extends ISingleCharacter {
	group: IGroupedCharacter;
	index: ISingleInteger;
	backward: boolean;
}
