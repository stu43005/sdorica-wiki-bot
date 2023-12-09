import { IConditionOfModel } from "./condition/IConditionOfModel.js";
import { SkillCastInfo } from "./SkillCastInfo.js";
import { SkillIcon } from "./SkillIcon.js";
import { ISingleCharacter } from "./target/ISingleCharacter.js";

export interface ConditionalSkillList {
	ConditionList: IConditionOfModel[];
	assignTarget: ISingleCharacter;
	SkillList: SkillCastInfo[];
	icon: SkillIcon;
	_characterCoolDown: number;
}
