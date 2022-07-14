import { ISingleBuff } from "../buff/single/ISingleBuff";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";
import { IOperationToBuff } from "./operateBuff/IOperationToBuff";

export interface OperateSingleBuff extends ITriggerOperation, IBaseOperation {
	buff: ISingleBuff;
	operation: IOperationToBuff;
}
