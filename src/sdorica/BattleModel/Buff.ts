import { Dictionary } from "../Dictionary";
import { BuffActiveTiming } from "./BuffActiveTiming";
import { BuffEffect } from "./BuffEffect";
import { BuffTag } from "./BuffTag";

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
