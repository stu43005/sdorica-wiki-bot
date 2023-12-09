import { ISingleBuff } from "../buff/single/ISingleBuff.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";
import { IOperationToBuff } from "./operateBuff/IOperationToBuff.js";

export interface OperateSingleBuff extends ITriggerOperation, IBaseOperation {
	buff: ISingleBuff;
	operation: IOperationToBuff;
}
