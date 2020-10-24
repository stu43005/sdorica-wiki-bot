import { ISingleInteger } from "./ISingleInteger";

export interface MultiplyFloat extends ISingleInteger {
	left: ISingleInteger;
	ratio: number;
}
