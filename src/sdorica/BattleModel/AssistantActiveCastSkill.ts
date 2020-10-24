import { AssistantActiveSkill } from "./AssistantActiveSkill";
import { SkillSet } from "./SkillSet";

export interface AssistantActiveCastSkill extends AssistantActiveSkill {
	Skill: SkillSet;
}
