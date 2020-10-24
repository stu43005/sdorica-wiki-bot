import { ISingleIntegerOfCharacter } from "../../constant/ISingleIntegerOfCharacter";
import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface FieldMaxChar extends ISingleCharacter {
	group: IGroupedCharacter;
	field: ISingleIntegerOfCharacter;
}
