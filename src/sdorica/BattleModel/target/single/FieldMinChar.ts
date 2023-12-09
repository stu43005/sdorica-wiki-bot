import { ISingleIntegerOfCharacter } from "../../constant/ISingleIntegerOfCharacter.js";
import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface FieldMinChar extends ISingleCharacter {
	group: IGroupedCharacter;
	field: ISingleIntegerOfCharacter;
}
