import { ISingleCharacter } from "./target/ISingleCharacter.js";

export interface SkillCastInfo {
	/* assignTarget */
	t: ISingleCharacter;
	SkillID: string;
	/* SequenceID */
	seq: string;

	// TODO:
	ConditionList: any[];
	_conditionalSequences: any[];
}
