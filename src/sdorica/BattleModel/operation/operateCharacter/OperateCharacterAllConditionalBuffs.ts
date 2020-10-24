import { IConditionOfBuff } from "../../condition/IConditionOfBuff";
import { IOperationToBuff } from "../operateBuff/IOperationToBuff";
import { IOperationToCharacter } from "./IOperationToCharacter";

export interface OperateCharacterAllConditionalBuffs extends IOperationToCharacter {
	condition: IConditionOfBuff;
	operation: IOperationToBuff;
}
