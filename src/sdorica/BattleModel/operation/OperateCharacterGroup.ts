import { IGroupedCharacter } from "../target/IGroupedCharacter";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";
import { IOperationToCharacter } from "./operateCharacter/IOperationToCharacter";

export interface OperateCharacterGroup extends ITriggerOperation, IBaseOperation {
	group: IGroupedCharacter;
	operation: IOperationToCharacter;
}
