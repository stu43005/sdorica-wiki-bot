import { IOperationToCharacter } from "./IOperationToCharacter.js";

export interface RemoveBuff extends IOperationToCharacter {
	buffId: string;
}
