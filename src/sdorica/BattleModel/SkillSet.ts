import { ConditionalSkillList } from "./ConditionalSkillList";

export interface SkillSet {
	_isViewSkillSet: boolean;
	ComboList: ConditionalSkillList[];
}

export namespace SkillSet {
	export const OPTION_NONE = 0;
	export const OPTION_NOT_AFFECT_CD = 1;
	export const OPTION_DEFAULT = 0;
}
