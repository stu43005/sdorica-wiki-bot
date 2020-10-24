import { IGroupedCharacter } from "./IGroupedCharacter";
import { ISingleCharacter } from "./ISingleCharacter";

export interface TargetResolver {
	IsMultiple: boolean;
	single?: ISingleCharacter;
	multi?: IGroupedCharacter;
}
