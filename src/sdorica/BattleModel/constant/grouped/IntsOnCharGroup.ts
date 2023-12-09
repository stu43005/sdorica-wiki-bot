import { BuffEnums } from "../../BuffEnums.js";
import { IGroupedCharacter } from "../../target/IGroupedCharacter.js";
import { IGroupedInteger } from "./IGroupedInteger.js";

export interface IntsOnCharGroup extends IGroupedInteger {
	group: IGroupedCharacter;
	targetField: BuffEnums.CharacterIntegerField;
}
