import { LevelEvent } from "./LevelEvent.js";

export interface LevelEventPoint {
	RoadPointIndex: number;
	Name: string;
	events: LevelEvent[];
}
