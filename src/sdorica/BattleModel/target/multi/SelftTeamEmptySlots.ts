import { IGroupedCharacter } from "../IGroupedCharacter";
import { ISingleCharacter } from "../ISingleCharacter";

export interface SelftTeamEmptySlots extends IGroupedCharacter {
	reference: ISingleCharacter;
}
