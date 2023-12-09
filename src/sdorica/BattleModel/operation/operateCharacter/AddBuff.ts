import { AddBuffData } from "../../AddBuffData.js";
import { IOperationToCharacter } from "./IOperationToCharacter.js";

export interface AddBuff extends IOperationToCharacter {
	buffToAdd: AddBuffData;
}
