import { AddBuffData } from "../../AddBuffData";
import { IOperationToCharacter } from "./IOperationToCharacter";

export interface AddBuff extends IOperationToCharacter {
	buffToAdd: AddBuffData;
}
