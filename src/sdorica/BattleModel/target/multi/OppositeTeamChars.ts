import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface OppositeTeamChars extends IGroupedCharacter {
	reference: ISingleCharacter;
	includeDead: boolean;
	includeEmpty: boolean;
}
