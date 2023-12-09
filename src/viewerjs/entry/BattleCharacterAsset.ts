import JSZip from "jszip";
import {
	localizationCharacterName,
	localizationCharacterNameWithDefault,
} from "../../localization.js";
import { Logger } from "../../logger.js";
import { BattleCharacterAsset } from "../../sdorica/BattleCharacterAsset.js";
import { AssistantActiveCastSkill } from "../../sdorica/BattleModel/AssistantActiveCastSkill.js";
import { AssistantActiveCastSkillWithPassiveBuff } from "../../sdorica/BattleModel/AssistantActiveCastSkillWithPassiveBuff.js";
import { AssistantPassiveBuffSkill } from "../../sdorica/BattleModel/AssistantPassiveBuffSkill.js";
import { AssistantSkill } from "../../sdorica/BattleModel/AssistantSkill.js";
import { BattleCharacter } from "../../sdorica/BattleModel/BattleCharacter.js";
import { BattleSkill } from "../../sdorica/BattleModel/BattleSkill.js";
import { EnemyAI } from "../../sdorica/BattleModel/EnemyAI.js";
import { IBattleSkill } from "../../sdorica/BattleModel/IBattleSkill.js";
import { SequenceEnemyAI } from "../../sdorica/BattleModel/SequenceEnemyAI.js";
import { SkillCastInfo } from "../../sdorica/BattleModel/SkillCastInfo.js";
import { SkillSet } from "../../sdorica/BattleModel/SkillSet.js";
import { StoneEraseType } from "../../sdorica/BattleModel/StoneSystem/StoneEraseType.js";
import { StoneType } from "../../sdorica/BattleModel/StoneSystem/StoneType.js";
import { Dictionary } from "../../sdorica/Dictionary.js";
import { objectEach, sortByCharacterModelNo } from "../../utils.js";
import { toLevel } from "../../wiki-hero.js";
import {
	InterpretedAssistantActiveCastSkill,
	InterpretedAssistantActiveCastSkillWithPassiveBuff,
	InterpretedAssistantPassiveBuffSkill,
	InterpretedAssistantSkill,
	InterpretedBattleCharacter,
	InterpretedSkillSet,
} from "../interpreted-battle-character.js";
import { type ViewerJSHelper } from "../viewerjs-helper.js";
import {
	addBuff,
	conditionStringify,
	getCharAsset,
	getCharAssets,
	ImperiumData,
	singleTargetStringify,
	skillUnitStringify,
	targetResolve,
} from "./$ViewerInit.js";

const logger = new Logger("BattleCharacterAsset");

export default async function (helper: ViewerJSHelper, data: BattleCharacterAsset) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	if (!data.character) {
		const loadFromCharAssets = prompt("loadFromCharAssets");
		const prefix = "battlecharacter_";
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
				const character: BattleCharacter = await getCharAsset(zipEntry);
				data = {
					m_Name: loadFromCharAssets,
					character: character,
				};
			} catch (error) {
				logger.log(`${loadFromCharAssets} parse error`);
				debugger;
				return {
					result: `${loadFromCharAssets} parse error`,
					error: String(error),
				};
			}
		} else {
			logger.log(`${loadFromCharAssets ?? ""} not found.`);
			debugger;
			return {
				result: `${loadFromCharAssets ?? ""} not found.`,
				可用的char清單: Object.keys(zip.files)
					.filter((k) => k.startsWith(prefix))
					.map((k) => k.replace(prefix, ""))
					.map((k) => k.replace(/\.[^\.]+$/, ""))
					.sort(sortByCharacterModelNo)
					.map((k) => {
						const name = localizationCharacterName()(k);
						return `${k}${name ? ` (${name})` : ""}`;
					}),
			};
		}
	}

	if (!data.character) {
		logger.log(`No character.`);
		debugger;
		return {
			result: `No character.`,
		};
	}

	let level = 0;
	if (!data.__skip_prompt) {
		level = Number(prompt("請輸入角色等級，用於體力及攻擊力計算"));
		if (isNaN(level)) {
			level = 0;
		}
	}

	const out: Record<string, any> = {
		$interpreted: interpreted(data.m_Name, data.character, level),
	};
	Object.assign(out, data);
	return out;
}

function enemyAi(ai: EnemyAI): string {
	if (ai.$type == "BattleModel.SequenceEnemyAI") {
		const seqAI = ai as SequenceEnemyAI;
		return seqAI.OrderList.join(" -> ");
	}
	logger.error(`Unknown enemy AI: ${ai.$type}`);
	debugger;
	return JSON.stringify(ai);
}

function skillCast(cast: SkillCastInfo): string {
	let target = ``;
	if (cast.t) {
		target = `對${singleTargetStringify(cast.t)}`;
	}
	return `${target}施展${cast.SkillID}`;
}

function skillSetTable(skillset: Record<string, SkillSet>) {
	const out: Record<string, InterpretedSkillSet[]> = {};
	objectEach(skillset, (key, value) => {
		out[key] = (out[key] || []).concat(skillSet(value));
	});
	return out;
}

function skillSet(skillset: SkillSet) {
	return skillset.ComboList.map((combo) => {
		const out2: InterpretedSkillSet = {
			條件: combo.ConditionList.map((condition) => conditionStringify(condition)),
			目標: singleTargetStringify(combo.assignTarget),
			技能列表: combo.SkillList.map((cast) => skillCast(cast)),
			CoolDown: combo._characterCoolDown,
		};
		return out2;
	});
}

function battleSkills(skills: Record<string, IBattleSkill>) {
	const out: Record<string, string[]> = {};
	objectEach(skills, (key, skill) => {
		out[key] = out[key] || [];
		if (!skill) {
			out[key].push(`${skill}`);
		} else if (skill.$type == "BattleModel.BattleSkill") {
			const bs = skill as BattleSkill;
			out[key] = out[key].concat(
				bs._skillIdentifiers.map((unit) => skillUnitStringify(unit)),
			);
		}
	});
	return out;
}

function assistantSkill(a1: AssistantSkill) {
	if (a1.$type == "BattleModel.AssistantPassiveBuffSkill") {
		const a2 = a1 as AssistantPassiveBuffSkill;
		const out: InterpretedAssistantPassiveBuffSkill = {
			類型: "被動參謀",
			起始CD: a1._startCD,
			技能CD: a1._skillCD,
			_startCastStack: a1._startCastStack,
			_maxCastStack: a1._maxCastStack,
			動作: `${targetResolve(a2.TargetSelector)}${addBuff(a2.BuffData)}`,
		};
		return out;
	}
	if (a1.$type == "BattleModel.AssistantActiveCastSkill") {
		const a2 = a1 as AssistantActiveCastSkill;
		const out: InterpretedAssistantActiveCastSkill = {
			類型: "技能參謀",
			起始CD: a1._startCD,
			技能CD: a1._skillCD,
			_startCastStack: a1._startCastStack,
			_maxCastStack: a1._maxCastStack,
			技能組: skillSet(a2.Skill),
		};
		return out;
	}
	if (
		a1.$type == "BattleModel.AssistantActiveCastSkillWithPassiveBuff" ||
		a1.$type == "AssistantActiveCastSkillWithPassiveBuff"
	) {
		const a2 = a1 as AssistantActiveCastSkillWithPassiveBuff;
		const out: InterpretedAssistantActiveCastSkillWithPassiveBuff = {
			類型: "技能+被動參謀",
			起始CD: a1._startCD,
			技能CD: a1._skillCD,
			_startCastStack: a1._startCastStack,
			_maxCastStack: a1._maxCastStack,
			技能組: skillSet(a2.Skill),
			被動: a2.PassiveBuffDatas.map(
				(p) => `${targetResolve(p.TargetSelector)}${addBuff(p.BuffData)}`,
			),
		};
		return out;
	}
	const out: InterpretedAssistantSkill = {
		類型: "參謀",
		起始CD: a1._startCD,
		技能CD: a1._skillCD,
		_startCastStack: a1._startCastStack,
		_maxCastStack: a1._maxCastStack,
	};
	if (a1.$type != "BattleModel.AssistantSkill") {
		out.類型 = JSON.stringify(a1);
		logger.error(`Unknown assistant skill: ${a1.$type}`);
	}
	return out;
}

function stoneEraseSetting(setting: Dictionary<StoneEraseType, string>): Record<string, string> {
	const out: Record<string, string> = {};
	for (const i in setting) {
		if (setting.hasOwnProperty(i)) {
			const entry = setting[i];
			out[StoneEraseType.toString(entry.Key)] = entry.Value;
		}
	}
	return out;
}

export function interpreted(name: string, data: BattleCharacter, level: number) {
	const out: InterpretedBattleCharacter = {
		Localization: localizationCharacterNameWithDefault()(name),
		攻擊力: data._power,
		血量: data._bloodCapacity,
		疊盾: data._armorCapacity,
		攻擊力等級調整後: toLevel(data._power, level),
		血量等級調整後: toLevel(data._bloodCapacity, level),
		疊盾等級調整後: toLevel(data._armorCapacity, level),
		復活魂芯數: data._reviveCount,
		站位: StoneType.toString(data._stoneType),
		起始CD: data._initialCoolDown,
		預設CD: data._defaultCoolDown,
		敵人AI: data._characterAI ? enemyAi(data._characterAI) : undefined,
		被動Buff: data._passiveBuff.map((buff) => addBuff(buff)),
		消魂設置: data._stoneEraseSetting ? stoneEraseSetting(data._stoneEraseSetting) : undefined,
		技能組: skillSetTable(data._skillsetTable),
		技能: battleSkills(data._skills),
		參謀技能: data._assistantSkill ? assistantSkill(data._assistantSkill) : undefined,
	};
	return out;
}
