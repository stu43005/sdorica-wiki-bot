import { Dictionary } from "../Dictionary.js";
import { BuffActiveTiming } from "./BuffActiveTiming.js";
import { BuffEffect } from "./BuffEffect.js";
import { BuffTag } from "./BuffTag.js";

export interface Buff {
	_tag: BuffTag;
	_duration: number;
	_maxLevel: number;
	_order: number;
	_actionTable: Dictionary<BuffActiveTiming, BuffEffect>;
}

export namespace Buff {
	export const TRIGGER_LIMIT_PER_TURN = 10;
}
