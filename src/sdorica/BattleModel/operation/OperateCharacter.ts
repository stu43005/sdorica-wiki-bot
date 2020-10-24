import { ISingleCharacter } from "../target/ISingleCharacter";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";
import { IOperationToCharacter } from "./operateCharacter/IOperationToCharacter";

export interface OperateCharacter extends ITriggerOperation, IBaseOperation {
	character: ISingleCharacter;
	operation: IOperationToCharacter;
}
