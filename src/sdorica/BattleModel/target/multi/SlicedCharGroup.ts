import { IGroupedCharacter } from "../IGroupedCharacter.js";

export interface SlicedCharGroup extends IGroupedCharacter {
	group: IGroupedCharacter;
	fromIndex: number;
	count: number;
	backward: boolean;
}
