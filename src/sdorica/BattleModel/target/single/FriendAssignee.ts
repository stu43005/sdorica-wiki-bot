import { ISingleCharacter } from "../ISingleCharacter";

export interface FriendAssignee extends ISingleCharacter {
	reference: ISingleCharacter;
}
