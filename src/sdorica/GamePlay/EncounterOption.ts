import { EncounterOptionEffect } from "./EncounterOptionEffect";

export interface EncounterOption {
	_id: string;
	_weight: number;
	_optionLocalizationKey: string;
	_optionIconKey: string;
	_animationEventKey: string;
	_conditionId: string;
	_optionEffectList: EncounterOptionEffect[];
}
