import { EncounterOptionSet } from "./EncounterOptionSet";

export interface EncounterGroup {
	_optionSets: Record<string, EncounterOptionSet>;
}
