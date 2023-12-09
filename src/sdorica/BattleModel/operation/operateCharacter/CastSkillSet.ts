import { IOperationToCharacter } from "./IOperationToCharacter.js";

export interface CastSkillSet extends IOperationToCharacter {
	skillsetId: string;
	resetCasterCD: boolean;
}
