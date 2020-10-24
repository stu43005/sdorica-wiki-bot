import { WaveSetAsset } from "../../sdorica/WaveSetAsset";
import { ViewerJSHelper } from "../viewerjs-helper";

export default async function (helper: ViewerJSHelper, data: WaveSetAsset) {
	data.$interpreted = interpreted(data);
	return data;
}

function interpreted(data: WaveSetAsset) {
	const out: string[] = [];
	const keys = Object.keys(data.Model.waves);
	for (let i = 0; i < keys.length; i++) {
		const waveKey = keys[i];
		const wave = data.Model.waves[waveKey];
		wave.weightedEnemySet.forEach((entry) => {
			out.push(`wave ${waveKey}: ${entry.Key.name} (level: ${entry.Value.level}, weight: ${entry.Value.weight})`);
		});
	}
	return out;
}
