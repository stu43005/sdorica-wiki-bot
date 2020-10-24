import { IOperationToCharacter } from "./IOperationToCharacter";

export interface CastSkillSet extends IOperationToCharacter {
	skillsetId: string;
	resetCasterCD: boolean;
}
