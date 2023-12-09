import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface SelfTeamDeadChars extends IGroupedCharacter {
	reference: ISingleCharacter;
}
