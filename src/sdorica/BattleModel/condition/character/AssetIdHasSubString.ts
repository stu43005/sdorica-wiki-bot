import { IConditionOfCharacter } from "../IConditionOfCharacter.js";

export interface AssetIdHasSubString extends IConditionOfCharacter {
	subString: string;
}
