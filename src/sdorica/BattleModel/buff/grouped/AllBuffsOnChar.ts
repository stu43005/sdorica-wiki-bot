import { ISingleCharacter } from "../../target/ISingleCharacter";
import { IGroupedBuff } from "./IGroupedBuff";

export interface AllBuffsOnChar extends IGroupedBuff {
	character: ISingleCharacter;
}
