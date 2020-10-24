import { AudioName } from "./AudioName";
import { LevelEventPoint } from "./LevelEventPoint";

export const DEFAULT_BATTLE_AUDIO = "music_common_battle";

export interface LevelEventModel {
	mainAudio: AudioName;
	_battleAudio: string;
	_walkingPhaseNotChangeCameraViewBoundSize: boolean;
	eventPoints: LevelEventPoint[];
}
