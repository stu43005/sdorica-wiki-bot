import { AssistantActiveSkill } from "./AssistantActiveSkill.js";
import { SkillSet } from "./SkillSet.js";

export interface AssistantActiveCastSkill extends AssistantActiveSkill {
	Skill: SkillSet;
}
