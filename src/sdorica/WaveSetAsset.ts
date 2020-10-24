import { WaveSet } from "./WaveSet";
import { WrapperAsset } from "./WrapperAsset";

export interface WaveSetAsset extends WrapperAsset<WaveSet> {
	$interpreted?: string[];
}
