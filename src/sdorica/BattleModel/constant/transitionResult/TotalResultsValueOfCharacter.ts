import { ISingleCharacter } from "../../target/ISingleCharacter.js";
import { ITransitionResultGroup } from "./group/ITransitionResultGroup.js";
import { ITransitionResultValue } from "./ITransitionResultValue.js";
import { TransitionCharacterType } from "./TransitionCharacterType.js";
import { TransitionValueType } from "./TransitionValueType.js";

export interface TotalResultsValueOfCharacter extends ITransitionResultValue {
	Results: ITransitionResultGroup;
	Character: ISingleCharacter;
	ValueType: TransitionValueType;
	CharType: TransitionCharacterType;
}
