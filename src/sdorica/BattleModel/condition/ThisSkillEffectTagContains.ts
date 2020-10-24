import { SkillProperty } from "../SkillProperty";
import { IConditionOfModel } from "./IConditionOfModel";

export interface ThisSkillEffectTagContains extends IConditionOfModel {
	containsAll: SkillProperty;
}
