import { ISingleCharacter } from "../../target/ISingleCharacter.js";
import { IGroupedBuff } from "./IGroupedBuff.js";

export interface AllBuffsOnChar extends IGroupedBuff {
	character: ISingleCharacter;
}
