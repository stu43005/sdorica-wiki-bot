import { ISingleCharacter } from "../ISingleCharacter";

export interface EnemyAssignee extends ISingleCharacter {
	reference: ISingleCharacter;
}
