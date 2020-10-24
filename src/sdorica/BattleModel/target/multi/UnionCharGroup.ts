import { IGroupedCharacter } from "../IGroupedCharacter";

export interface UnionCharGroup extends IGroupedCharacter {
	group1: IGroupedCharacter;
	group2: IGroupedCharacter;
}
