import { LevelEvent } from "./LevelEvent";

export interface LevelEventPoint {
	RoadPointIndex: number;
	Name: string;
	events: LevelEvent[];
}
