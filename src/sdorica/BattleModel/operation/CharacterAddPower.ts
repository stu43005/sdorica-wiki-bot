import { ISingleInteger } from "../constant/ISingleInteger";
import { ISingleCharacter } from "../target/ISingleCharacter";
import { IBaseOperation } from "./IBaseOperation";
import { ICalculatePowerOperation } from "./ICalculatePowerOperation";

export interface CharacterAddPower extends ICalculatePowerOperation, IBaseOperation {
	character: ISingleCharacter;
	value: ISingleInteger;
	isPercent: boolean;
}
