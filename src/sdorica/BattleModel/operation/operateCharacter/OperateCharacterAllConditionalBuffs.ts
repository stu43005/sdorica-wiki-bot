import { IConditionOfBuff } from "../../condition/IConditionOfBuff.js";
import { IOperationToBuff } from "../operateBuff/IOperationToBuff.js";
import { IOperationToCharacter } from "./IOperationToCharacter.js";

export interface OperateCharacterAllConditionalBuffs extends IOperationToCharacter {
	condition: IConditionOfBuff;
	operation: IOperationToBuff;
}
