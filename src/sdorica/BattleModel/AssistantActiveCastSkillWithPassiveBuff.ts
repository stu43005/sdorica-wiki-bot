import { AddBuffData } from "./AddBuffData.js";
import { AssistantActiveCastSkill } from "./AssistantActiveCastSkill.js";
import { TargetResolver } from "./target/TargetResolver.js";

export interface AssistantActiveCastSkillWithPassiveBuff extends AssistantActiveCastSkill {
	PassiveBuffDatas: PassiveBuffData[];
}

export interface PassiveBuffData {
	BuffData: AddBuffData;
	TargetSelector: TargetResolver;
}
