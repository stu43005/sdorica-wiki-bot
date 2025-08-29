import { AssistantActiveCastSkill } from "./AssistantActiveCastSkill.js";
import { PassiveBuffData } from "./PassiveBuffData.js";

export interface AssistantActiveCastSkillWithPassiveBuff extends AssistantActiveCastSkill {
	PassiveBuffDatas: PassiveBuffData[];
}
