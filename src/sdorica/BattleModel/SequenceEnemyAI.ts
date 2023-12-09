import { EnemyAI } from "./EnemyAI.js";

export interface SequenceEnemyAI extends EnemyAI {
	OrderList: string[];
}
