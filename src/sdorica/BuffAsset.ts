import { BaseBuffAsset } from "./BaseBuffAsset.js";
import { Buff } from "./BattleModel/Buff.js";

export interface BuffAsset extends BaseBuffAsset {
	Model: Buff;
	buffIcon?: /* Sprite */ any;

	$interpreted?: InterpretedBuffAsset;
}

export interface InterpretedBuffAsset {
	Localization: string;
	標籤: string;
	持續時間: number;
	最高層數: number;
	動作: Record<string, InterpretedBuffEffect>;
}

export interface InterpretedBuffEffect {
	條件: string[];
	效果: InterpretedBuffSequence[];
}

export interface InterpretedBuffSequence {
	條件: string[];
	效果: string[];
}
