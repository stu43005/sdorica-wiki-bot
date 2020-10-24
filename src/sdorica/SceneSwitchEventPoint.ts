import { LevelEvent } from "./LevelEvent";

export interface SceneSwitchEventPoint extends LevelEvent {
	SceneName: string;
	LevelName: string;
	DropItemGroupId: string | null;
}
