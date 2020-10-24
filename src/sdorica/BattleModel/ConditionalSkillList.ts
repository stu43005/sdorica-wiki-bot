import { IConditionOfModel } from "./condition/IConditionOfModel";
import { SkillCastInfo } from "./SkillCastInfo";
import { SkillIcon } from "./SkillIcon";
import { ISingleCharacter } from "./target/ISingleCharacter";

export interface ConditionalSkillList {
	ConditionList: IConditionOfModel[];
	assignTarget: ISingleCharacter;
	SkillList: SkillCastInfo[];
	icon: SkillIcon;
	_characterCoolDown: number;
}
