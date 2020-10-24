import { AddBuffData } from "./AddBuffData";
import { AssistantPassiveSkill } from "./AssistantPassiveSkill";
import { SkillIcon } from "./SkillIcon";
import { TargetResolver } from "./target/TargetResolver";

export interface AssistantPassiveBuffSkill extends AssistantPassiveSkill {
	BuffData: AddBuffData;
	_skillIcon: SkillIcon;
	TargetSelector: TargetResolver;
}
