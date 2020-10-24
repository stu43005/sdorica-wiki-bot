import { SkillProperty } from "../SkillProperty";

export interface BaseSkillEffect {
	$type: string;
	Tag: SkillProperty;
	_keyString: string;
}
