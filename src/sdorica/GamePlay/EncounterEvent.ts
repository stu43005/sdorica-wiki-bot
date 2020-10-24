import { Vector3 } from "../../lib/Unity/Vector3";
import { LevelEvent } from "../LevelEvent";
import { EncounterGroup } from "./EncounterGroup";
import { EncounterOptionSet } from "./EncounterOptionSet";

export interface EncounterEvent extends LevelEvent {
	_encounterGroup: EncounterGroup;
	_optionSets: Record<string, EncounterOptionSet>;
	// _encounterObjectId: string,
	// _titleLocalizationKey: string,
	// _mustTrigger: boolean,
	// _isClicked: boolean,
	// _encounterLevel: number,
	// _optionSet: EncounterOptionSet,
	// _selectedOptionSetId: string,
	EventPosition: Vector3;
	EventDistance: number;
}
