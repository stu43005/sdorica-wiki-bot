import { EncounterOption } from "./EncounterOption";

export interface EncounterOptionSet {
	_encounterOptionList: EncounterOption[];
	_groupId: string;
	_choiceNum: number;
	_mustTrigger: boolean;
	_titleLocalizationKey: string;
	_weight: number;
	_encounterObjectId: string;
	_setLevel: number;
}
