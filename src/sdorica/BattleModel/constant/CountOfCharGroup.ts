import { IGroupedCharacter } from "../target/IGroupedCharacter";
import { ISingleInteger } from "./ISingleInteger";

export interface CountOfCharGroup extends ISingleInteger {
	group: IGroupedCharacter;
}
