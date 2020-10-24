import { IGroupedCharacter } from "../../target/IGroupedCharacter";
import { ITransitionResultGroup } from "./group/ITransitionResultGroup";
import { ITransitionResultValue } from "./ITransitionResultValue";
import { TransitionCharacterType } from "./TransitionCharacterType";
import { TransitionValueType } from "./TransitionValueType";

export interface TotalResultsValueOfCharacterGroup extends ITransitionResultValue {
	Results: ITransitionResultGroup;
	Group: IGroupedCharacter;
	ValueType: TransitionValueType;
	CharType: TransitionCharacterType;
}
