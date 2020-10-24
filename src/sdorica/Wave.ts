import { Dictionary } from "./Dictionary";
import { EnemySetName } from "./EnemySetName";
import { WaveParameter } from "./WaveParameter";

export interface Wave {
	weightedEnemySet: Dictionary<EnemySetName, WaveParameter>;
}
