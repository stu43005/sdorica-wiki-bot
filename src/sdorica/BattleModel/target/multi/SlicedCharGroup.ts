import { IGroupedCharacter } from "../IGroupedCharacter";

export interface SlicedCharGroup extends IGroupedCharacter {
	group: IGroupedCharacter;
	fromIndex: number;
	count: number;
	backward: boolean;
}
