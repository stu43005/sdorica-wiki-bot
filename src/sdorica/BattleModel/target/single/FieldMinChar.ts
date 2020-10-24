import { ISingleIntegerOfCharacter } from "../../constant/ISingleIntegerOfCharacter";
import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface FieldMinChar extends ISingleCharacter {
	group: IGroupedCharacter;
	field: ISingleIntegerOfCharacter;
}
