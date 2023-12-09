import { ISingleCharacter } from "../ISingleCharacter.js";

export interface EnemyAssignee extends ISingleCharacter {
	reference: ISingleCharacter;
}
