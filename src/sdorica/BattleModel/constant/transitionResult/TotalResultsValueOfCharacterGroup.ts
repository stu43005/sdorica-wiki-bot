import { IGroupedCharacter } from "../../target/IGroupedCharacter.js";
import { ITransitionResultGroup } from "./group/ITransitionResultGroup.js";
import { ITransitionResultValue } from "./ITransitionResultValue.js";
import { TransitionCharacterType } from "./TransitionCharacterType.js";
import { TransitionValueType } from "./TransitionValueType.js";

export interface TotalResultsValueOfCharacterGroup extends ITransitionResultValue {
	Results: ITransitionResultGroup;
	Group: IGroupedCharacter;
	ValueType: TransitionValueType;
	CharType: TransitionCharacterType;
}
