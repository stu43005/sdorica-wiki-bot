import { SkillProperty } from "../SkillProperty.js";

export interface BaseSkillEffect {
	$type: string;
	Tag: SkillProperty;
	_keyString: string;
}
