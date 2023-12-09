import { ISingleCharacter } from "../../target/ISingleCharacter.js";
import { ISingleBuff } from "./ISingleBuff.js";

export interface BuffOnCharater extends ISingleBuff {
	character: ISingleCharacter;
	buffId: string;
}
