import { ISingleInteger } from "./ISingleInteger";
import { ITransitionResultValue } from "./transitionResult/ITransitionResultValue";

export interface TransitionResultValue extends ISingleInteger {
	ResultValue: ITransitionResultValue;
}
