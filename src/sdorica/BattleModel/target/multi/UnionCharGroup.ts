import { IGroupedCharacter } from "../IGroupedCharacter.js";

export interface UnionCharGroup extends IGroupedCharacter {
	group1: IGroupedCharacter;
	group2: IGroupedCharacter;
}
