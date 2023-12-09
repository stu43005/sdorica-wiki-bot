import { IGroupedCharacter } from "./IGroupedCharacter.js";
import { ISingleCharacter } from "./ISingleCharacter.js";

export interface TargetResolver {
	IsMultiple: boolean;
	single?: ISingleCharacter;
	multi?: IGroupedCharacter;
}
