import { ISingleInteger } from "../constant/ISingleInteger.js";
import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ICalculatePowerOperation } from "./ICalculatePowerOperation.js";

export interface CharacterAddPower extends ICalculatePowerOperation, IBaseOperation {
	character: ISingleCharacter;
	value: ISingleInteger;
	isPercent: boolean;
}
