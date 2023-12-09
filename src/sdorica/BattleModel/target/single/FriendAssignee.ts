import { ISingleCharacter } from "../ISingleCharacter.js";

export interface FriendAssignee extends ISingleCharacter {
	reference: ISingleCharacter;
}
