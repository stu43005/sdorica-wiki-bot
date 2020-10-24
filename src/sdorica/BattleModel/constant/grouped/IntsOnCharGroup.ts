import { BuffEnums } from "../../BuffEnums";
import { IGroupedCharacter } from "../../target/IGroupedCharacter";
import { IGroupedInteger } from "./IGroupedInteger";

export interface IntsOnCharGroup extends IGroupedInteger {
	group: IGroupedCharacter;
	targetField: BuffEnums.CharacterIntegerField;
}
