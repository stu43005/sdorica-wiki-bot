import { BuffEnums } from "../../BuffEnums";
import { ISingleInteger } from "../../constant/ISingleInteger";
import { IOperationToBuff } from "./IOperationToBuff";

export interface SetBuffField extends IOperationToBuff {
	targetField: BuffEnums.BuffIntergerField;
	setOperator: BuffEnums.SetterOp;
	value: ISingleInteger;
}
