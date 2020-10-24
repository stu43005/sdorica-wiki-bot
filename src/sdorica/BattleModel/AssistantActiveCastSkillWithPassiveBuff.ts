import { AddBuffData } from "./AddBuffData";
import { AssistantActiveCastSkill } from "./AssistantActiveCastSkill";
import { TargetResolver } from "./target/TargetResolver";

export interface AssistantActiveCastSkillWithPassiveBuff extends AssistantActiveCastSkill {
	PassiveBuffDatas: PassiveBuffData[];
}

export interface PassiveBuffData {
	BuffData: AddBuffData;
	TargetSelector: TargetResolver;
}
