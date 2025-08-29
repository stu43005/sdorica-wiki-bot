import { AddBuffData } from "./AddBuffData.js";
import { AssistantPassiveSkill } from "./AssistantPassiveSkill.js";
import { PassiveBuffData } from "./PassiveBuffData.js";
import { SkillIcon } from "./SkillIcon.js";
import { TargetResolver } from "./target/TargetResolver.js";

export interface AssistantPassiveBuffSkill extends AssistantPassiveSkill {
	/**
	 * @deprecated
	 */
	BuffData: AddBuffData;
	/**
	 * @deprecated
	 */
	TargetSelector: TargetResolver;
	PassiveBuffDatas: PassiveBuffData[];
	_skillIcon: SkillIcon;
}
