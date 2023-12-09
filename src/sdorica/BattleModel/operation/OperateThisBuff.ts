import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";
import { IOperationToBuff } from "./operateBuff/IOperationToBuff.js";

export interface OperateThisBuff extends ITriggerOperation, IBaseOperation {
	operation: IOperationToBuff;
}
