import { ISingleInteger } from "./ISingleInteger.js";
import { ITransitionResultValue } from "./transitionResult/ITransitionResultValue.js";

export interface TransitionResultValue extends ISingleInteger {
	ResultValue: ITransitionResultValue;
}
