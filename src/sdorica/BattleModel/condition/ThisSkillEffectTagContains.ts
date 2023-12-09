import { SkillProperty } from "../SkillProperty.js";
import { IConditionOfModel } from "./IConditionOfModel.js";

export interface ThisSkillEffectTagContains extends IConditionOfModel {
	containsAll: SkillProperty;
}
