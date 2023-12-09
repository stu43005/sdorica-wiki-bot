import { IGroupedCharacter } from "../target/IGroupedCharacter.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";
import { IOperationToCharacter } from "./operateCharacter/IOperationToCharacter.js";

export interface OperateCharacterGroup extends ITriggerOperation, IBaseOperation {
	group: IGroupedCharacter;
	operation: IOperationToCharacter;
}
