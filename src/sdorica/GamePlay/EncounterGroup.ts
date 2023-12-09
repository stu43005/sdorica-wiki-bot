import { EncounterOptionSet } from "./EncounterOptionSet.js";

export interface EncounterGroup {
	_optionSets: Record<string, EncounterOptionSet>;
}
