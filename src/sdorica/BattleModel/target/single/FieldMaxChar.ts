import { ISingleIntegerOfCharacter } from "../../constant/ISingleIntegerOfCharacter.js";
import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface FieldMaxChar extends ISingleCharacter {
	group: IGroupedCharacter;
	field: ISingleIntegerOfCharacter;
}
