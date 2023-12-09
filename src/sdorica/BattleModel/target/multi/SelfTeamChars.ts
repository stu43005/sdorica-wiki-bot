import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface SelfTeamChars extends IGroupedCharacter {
	reference: ISingleCharacter;
	excludeSelf: boolean;
	includeDead: boolean;
	includeEmpty: boolean;
}
