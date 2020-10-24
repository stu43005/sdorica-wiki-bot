import { EnemyAI } from "./EnemyAI";

export interface SequenceEnemyAI extends EnemyAI {
	OrderList: string[];
}
