import { LevelEvent } from "./LevelEvent.js";

export interface SceneSwitchEventPoint extends LevelEvent {
	SceneName: string;
	LevelName: string;
	DropItemGroupId: string | null;
}
