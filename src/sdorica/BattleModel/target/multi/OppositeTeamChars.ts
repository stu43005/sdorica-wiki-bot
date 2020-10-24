import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface OppositeTeamChars extends IGroupedCharacter {
	reference: ISingleCharacter;
	includeDead: boolean;
	includeEmpty: boolean;
}
