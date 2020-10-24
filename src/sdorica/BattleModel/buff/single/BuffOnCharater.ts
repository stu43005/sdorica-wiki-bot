import { ISingleCharacter } from "../../target/ISingleCharacter";
import { ISingleBuff } from "./ISingleBuff";

export interface BuffOnCharater extends ISingleBuff {
	character: ISingleCharacter;
	buffId: string;
}
