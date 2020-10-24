import { IOperationToCharacter } from "./IOperationToCharacter";

export interface RemoveBuff extends IOperationToCharacter {
	buffId: string;
}
