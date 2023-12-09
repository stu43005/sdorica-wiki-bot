import { AddBuffData } from "./AddBuffData.js";
import { AssistantPassiveSkill } from "./AssistantPassiveSkill.js";
import { SkillIcon } from "./SkillIcon.js";
import { TargetResolver } from "./target/TargetResolver.js";

export interface AssistantPassiveBuffSkill extends AssistantPassiveSkill {
	BuffData: AddBuffData;
	_skillIcon: SkillIcon;
	TargetSelector: TargetResolver;
}
