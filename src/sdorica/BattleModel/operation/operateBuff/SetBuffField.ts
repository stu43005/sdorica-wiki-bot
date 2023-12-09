import { BuffEnums } from "../../BuffEnums.js";
import { ISingleInteger } from "../../constant/ISingleInteger.js";
import { IOperationToBuff } from "./IOperationToBuff.js";

export interface SetBuffField extends IOperationToBuff {
	targetField: BuffEnums.BuffIntergerField;
	setOperator: BuffEnums.SetterOp;
	value: ISingleInteger;
	lastIndepedentStack?: boolean;
}
