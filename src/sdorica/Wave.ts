import { Dictionary } from "./Dictionary.js";
import { EnemySetName } from "./EnemySetName.js";
import { WaveParameter } from "./WaveParameter.js";

export interface Wave {
	weightedEnemySet: Dictionary<EnemySetName, WaveParameter>;
}
