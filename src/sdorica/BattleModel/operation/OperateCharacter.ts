import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";
import { IOperationToCharacter } from "./operateCharacter/IOperationToCharacter.js";

export interface OperateCharacter extends ITriggerOperation, IBaseOperation {
	character: ISingleCharacter;
	operation: IOperationToCharacter;
}
