import { CharAssetsRaw } from "../../data-raw-type";
import { localizationBuffName, localizationString } from "../../localization";
import { Buff } from "../../sdorica/BattleModel/Buff";
import { BuffActiveTiming } from "../../sdorica/BattleModel/BuffActiveTiming";
import { BuffEffect } from "../../sdorica/BattleModel/BuffEffect";
import { BuffSequence } from "../../sdorica/BattleModel/BuffSequence";
import { BuffTag } from "../../sdorica/BattleModel/BuffTag";
import { BuffAsset, InterpretedBuffAsset, InterpretedBuffEffect, InterpretedBuffSequence } from "../../sdorica/BuffAsset";
import { Dictionary } from "../../sdorica/Dictionary";
import { sortByCharacterModelNo } from "../../utils";
import { ViewerJSHelper } from "../viewerjs-helper";
import { conditionStringify, fsSerializer, getCharAssets, ImperiumData, operationStringify, siJsonParse } from "./$ViewerInit";

export default async function (helper: ViewerJSHelper, data: BuffAsset) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	if (!data.Model) {
		const loadFromCharAssets = prompt("loadFromCharAssets");

		let charAssets: CharAssetsRaw;
		try {
			charAssets = await getCharAssets(helper);
		} catch (error) {
			console.log(`charAssets.json fetch error.`);
			debugger;
			return {
				result: `charAssets.json fetch error.`,
				error: String(error),
			};
		}

		if (loadFromCharAssets && charAssets.Buffs[loadFromCharAssets]) {
			try {
				const row = charAssets.Buffs[loadFromCharAssets];
				const json = siJsonParse(row);

				const serializer = new fsSerializer();
				const deserialized = serializer.TryDeserialize(json) as Buff;
				data = {
					m_Name: loadFromCharAssets,
					Model: deserialized,
				};
			} catch (error) {
				console.log(`${loadFromCharAssets} parse error`);
				debugger;
				return {
					result: `${loadFromCharAssets} parse error`,
					error: String(error),
				};
			}
		}
		else {
			console.log(`${loadFromCharAssets ?? ""} not found.`);
			debugger;
			return {
				result: `${loadFromCharAssets ?? ""} not found.`,
				"可用的buff清單": Object.keys(charAssets.Buffs).sort(sortByCharacterModelNo).map(k => localizationBuffName(true)(k)),
			};
		}
	}

	if (!data.Model) {
		console.error(`No Model.`);
		debugger;
		return {
			result: `No Model.`
		};
	}

	const out: Record<string, any> = {
		$interpreted: interpreted(data.m_Name, data.Model),
	};
	Object.assign(out, data);
	return out;
}

function buffSequence(seq: BuffSequence): InterpretedBuffSequence {
	const out: InterpretedBuffSequence = {
		"條件": seq.Conditions.map(c => conditionStringify(c)),
		"效果": seq.Actions.map(a => operationStringify(a.TargetField)),
	};
	return out;
}

function buffActions(actionTable: Dictionary<BuffActiveTiming, BuffEffect>): Record<string, InterpretedBuffEffect> {
	const out: Record<string, InterpretedBuffEffect> = {};
	for (const i in actionTable) {
		if (actionTable.hasOwnProperty(i)) {
			const entry = actionTable[i];
			const key = BuffActiveTiming.toString(entry.Key);
			const out2: InterpretedBuffEffect = {
				"條件": entry.Value.Conditions.map(c => conditionStringify(c)),
				"效果": entry.Value.Actions.map(a => buffSequence(a)),
			};
			out[key] = out2;
		}
	}
	return out;
}

function interpreted(name: string, data: Buff) {
	const out: InterpretedBuffAsset = {
		"Localization": localizationString("Buff")(name),
		"標籤": BuffTag.toString(data._tag),
		"持續時間": data._duration,
		"最高層數": data._maxLevel,
		"動作": buffActions(data._actionTable),
	};
	return out;
}
