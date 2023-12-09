import { ISingleCharacter } from "../ISingleCharacter.js";

export interface BuffAssignedCharacter extends ISingleCharacter {
	_value: ISingleCharacter;
}
