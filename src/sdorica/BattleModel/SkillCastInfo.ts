import { ISingleCharacter } from "./target/ISingleCharacter";

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
