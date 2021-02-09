import JSZip from "jszip";
import { localizationBuffName, localizationString } from "../../localization";
import { Logger } from "../../logger";
import { Buff } from "../../sdorica/BattleModel/Buff";
import { BuffActiveTiming } from "../../sdorica/BattleModel/BuffActiveTiming";
import { BuffEffect } from "../../sdorica/BattleModel/BuffEffect";
import { BuffSequence } from "../../sdorica/BattleModel/BuffSequence";
import { BuffTag } from "../../sdorica/BattleModel/BuffTag";
import { BuffAsset, InterpretedBuffAsset, InterpretedBuffEffect, InterpretedBuffSequence } from "../../sdorica/BuffAsset";
import { Dictionary } from "../../sdorica/Dictionary";
import { sortByCharacterModelNo } from "../../utils";
import { ViewerJSHelper } from "../viewerjs-helper";
import { conditionStringify, getCharAsset, getCharAssets, ImperiumData, operationStringify } from "./$ViewerInit";

const logger = new Logger('BuffAsset');

export default async function (helper: ViewerJSHelper, data: BuffAsset) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	if (!data.Model) {
		const loadFromCharAssets = prompt("loadFromCharAssets");
		const prefix = "buff_";
		const filename = `${prefix}${loadFromCharAssets?.toLocaleLowerCase()}`;

		let zip: JSZip;
		try {
			zip = await getCharAssets(helper);
		} catch (error) {
			logger.log(`CharAssets.zip fetch error.`);
			debugger;
			return {
				result: `CharAssets.zip fetch error.`,
				error: String(error),
			};
		}

		const zipEntry = zip.files[`${filename}.bson`];
		if (loadFromCharAssets && zipEntry) {
			try {
				const buff: Buff = await getCharAsset(zipEntry);
				data = {
					m_Name: loadFromCharAssets,
					Model: buff,
				};
			} catch (error) {
				logger.log(`${loadFromCharAssets} parse error`);
				debugger;
				return {
					result: `${loadFromCharAssets} parse error`,
					error: String(error),
				};
			}
		}
		else {
			logger.log(`${loadFromCharAssets ?? ""} not found.`);
			debugger;
			return {
				result: `${loadFromCharAssets ?? ""} not found.`,
				"可用的buff清單": Object.keys(zip.files)
					.filter(k => k.startsWith(prefix))
					.map(k => k.replace(prefix, ''))
					.map(k => k.replace(/\.[^\.]+$/, ''))
					.sort(sortByCharacterModelNo)
					.map(k => localizationBuffName(true)(k)),
			};
		}
	}

	if (!data.Model) {
		logger.error(`No Model.`);
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

export function interpreted(name: string, data: Buff) {
	const out: InterpretedBuffAsset = {
		"Localization": localizationString("Buff")(name),
		"標籤": BuffTag.toString(data._tag),
		"持續時間": data._duration,
		"最高層數": data._maxLevel,
		"動作": buffActions(data._actionTable),
	};
	return out;
}
