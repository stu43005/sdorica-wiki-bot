import { SummonCharacterState } from "./SummonCharacterState.js";

export interface SummonCharacterArg {
	AssetName: string;
	State: SummonCharacterState;
	SummonCasterLevel: number;
}
