import { ISingleCharacter } from "../../target/ISingleCharacter";
import { ITransitionResultGroup } from "./group/ITransitionResultGroup";
import { ITransitionResultValue } from "./ITransitionResultValue";
import { TransitionCharacterType } from "./TransitionCharacterType";
import { TransitionValueType } from "./TransitionValueType";

export interface TotalResultsValueOfCharacter extends ITransitionResultValue {
	Results: ITransitionResultGroup;
	Character: ISingleCharacter;
	ValueType: TransitionValueType;
	CharType: TransitionCharacterType;
}
