import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";
import { IOperationToBuff } from "./operateBuff/IOperationToBuff";

export interface OperateThisBuff extends ITriggerOperation, IBaseOperation {
	operation: IOperationToBuff;
}
