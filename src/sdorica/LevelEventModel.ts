import { AudioName } from "./AudioName.js";
import { LevelEventPoint } from "./LevelEventPoint.js";

export const DEFAULT_BATTLE_AUDIO = "music_common_battle";

export interface LevelEventModel {
	mainAudio: AudioName;
	_battleAudio: string;
	_walkingPhaseNotChangeCameraViewBoundSize: boolean;
	eventPoints: LevelEventPoint[];
}
