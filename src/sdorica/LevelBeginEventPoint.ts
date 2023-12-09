import { LevelEvent } from "./LevelEvent.js";

export interface LevelBeginEventPoint extends LevelEvent {
	_mainAudioVolume: number;
}
