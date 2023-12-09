import { WaveSet } from "./WaveSet.js";
import { WrapperAsset } from "./WrapperAsset.js";

export interface WaveSetAsset extends WrapperAsset<WaveSet> {
	$interpreted?: string[];
}
