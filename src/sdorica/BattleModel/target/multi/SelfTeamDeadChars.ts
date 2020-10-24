import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface SelfTeamDeadChars extends IGroupedCharacter {
	reference: ISingleCharacter;
}
