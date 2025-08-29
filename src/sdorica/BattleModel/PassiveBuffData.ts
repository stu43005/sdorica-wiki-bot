import { AddBuffData } from "./AddBuffData.js";
import { TargetResolver } from "./target/TargetResolver.js";

export interface PassiveBuffData {
	BuffData: AddBuffData;
	TargetSelector: TargetResolver;
}
