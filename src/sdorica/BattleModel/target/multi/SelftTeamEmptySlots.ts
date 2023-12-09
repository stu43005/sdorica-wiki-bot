import { IGroupedCharacter } from "../IGroupedCharacter.js";
import { ISingleCharacter } from "../ISingleCharacter.js";

export interface SelftTeamEmptySlots extends IGroupedCharacter {
	reference: ISingleCharacter;
}
