import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface SelfTeamChars extends IGroupedCharacter {
	reference: ISingleCharacter;
	excludeSelf: boolean;
	includeDead: boolean;
	includeEmpty: boolean;
}
