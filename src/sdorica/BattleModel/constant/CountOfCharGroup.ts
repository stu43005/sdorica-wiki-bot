import { IGroupedCharacter } from "../target/IGroupedCharacter.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface CountOfCharGroup extends ISingleInteger {
	group: IGroupedCharacter;
}
