import { localizationBuffName } from "../../../localization.js";
import { numMultiply } from "../../../utils.js";
import { AddBuffData } from "../AddBuffData.js";
import { groupedBuffIdStringify } from "../buff/BuffStringify.js";
import { CheckBuffMatchBuffId } from "../condition/buff/CheckBuffMatchBuffId.js";
import { conditionBuffStringify } from "../condition/ConditionStringify.js";
import { constantStringify } from "../constant/ConstantStringify.js";
import { NumberOperation } from "../operation/NumberOperation.js";
import { BoardModificationStoneAction } from "../StoneSystem/BoardModificationStoneAction.js";
import { Constraint } from "../StoneSystem/Constraint.js";
import { StoneBuffAction } from "../StoneSystem/StoneBuffAction.js";
import { summonStringify } from "../summon/SummonStringify.js";
import { singleTargetStringify } from "../target/TargetStringify.js";
import { AddBuffFromGroupedBuffIdSkillEffect } from "./AddBuffFromGroupedBuffIdSkillEffect.js";
import { AddBuffSkillEffect } from "./AddBuffSkillEffect.js";
import { AmrBreakDrainSkillEffect } from "./AmrBreakDrainSkillEffect.js";
import { AmrBreakSkillEffect } from "./AmrBreakSkillEffect.js";
import { AmrGainSkillEffect } from "./AmrGainSkillEffect.js";
import { AmrReduceRatioSkillEffect } from "./AmrReduceRatioSkillEffect.js";
import { AmrReduceSkillEffect } from "./AmrReduceSkillEffect.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";
import { ChangeCDSkillEffect } from "./ChangeCDSkillEffect.js";
import { ChangeExploreFlagSkillEffect } from "./ChangeExploreFlagSkillEffect.js";
import { ChangeHungerSkillEffect } from "./ChangeHungerSkillEffect.js";
import { ChangeReviveCountSkillEffect } from "./ChangeReviveCountSkillEffect.js";
import { ChangeTireSkillEffect } from "./ChangeTireSkillEffect.js";
import { CopyBuffFromCharacterSkillEffect } from "./CopyBuffFromCharacterSkillEffect.js";
import { HpDamageDrainSkillEffect } from "./HpDamageDrainSkillEffect.js";
import { HpDamageRatioCurrentSkillEffect } from "./HpDamageRatioCurrentSkillEffect.js";
import { HpDamageRatioMaxSkillEffect } from "./HpDamageRatioMaxSkillEffect.js";
import { HpDamageSkillEffect } from "./HpDamageSkillEffect.js";
import { HpHealSkillEffect } from "./HpHealSkillEffect.js";
import { NumericSkillEffect } from "./NumericSkillEffect.js";
import { RemoveBuffFromGroupedBuffIdSkillEffect } from "./RemoveBuffFromGroupedBuffIdSkillEffect.js";
import { RemoveBuffSkillEffect } from "./RemoveBuffSkillEffect.js";
import { ReviveSkillEffect } from "./ReviveSkillEffect.js";
import { SetCDSkillEffect } from "./SetCDSkillEffect.js";
import { StoneActionSkillEffect } from "./StoneActionSkillEffect.js";
import { StoneBuffSkillEffect } from "./StoneBuffSkillEffect.js";
import { SummonEnemySkillEffect } from "./SummonEnemySkillEffect.js";
import { TrueDamageSkillEffect } from "./TrueDamageSkillEffect.js";

export function skillEffectStringify(skillEffect: BaseSkillEffect): string {
	if (!skillEffect) return "";
	if (skillEffect.$type == "BattleModel.AddBuffSkillEffect") {
		const obj = skillEffect as AddBuffSkillEffect;
		return obj._buffData.map((b) => addBuff(b)).join("、");
	}
	if (skillEffect.$type == "BattleModel.RemoveBuffSkillEffect") {
		const obj = skillEffect as RemoveBuffSkillEffect;
		return `移除狀態${localizationBuffName(true)(obj._buffID)}`;
	}
	if (skillEffect.$type == "BattleModel.AddBuffFromGroupedBuffIdSkillEffect") {
		const obj = skillEffect as AddBuffFromGroupedBuffIdSkillEffect;
		if (obj.AddAllBuff) {
			return `賦予${
				obj.Forever || obj.OverwriteDuration < 0 ? "永久" : `${obj.OverwriteDuration}回合`
			}${obj.LevelStack > 0 ? `${obj.LevelStack}層` : ""}${groupedBuffIdStringify(
				obj.BuffGroupIds,
			)}`;
		}
		return `賦予${
			obj.Forever || obj.OverwriteDuration < 0 ? "永久" : `${obj.OverwriteDuration}回合`
		}${obj.LevelStack > 0 ? `${obj.LevelStack}層` : ""}在${groupedBuffIdStringify(
			obj.BuffGroupIds,
		)}中隨機挑選${obj.NotRepeatSameBuffId ? "不重複的" : "的"}${obj.RandomAddCount}個Buff`;
	}
	if (skillEffect.$type == "BattleModel.RemoveBuffFromGroupedBuffIdSkillEffect") {
		const obj = skillEffect as RemoveBuffFromGroupedBuffIdSkillEffect;
		if (obj.RemoveAllBuff) {
			return `移除在${groupedBuffIdStringify(obj.BuffGroupIds)}`;
		}
		return `移除在${groupedBuffIdStringify(obj.BuffGroupIds)}中隨機挑選的${
			obj.RandomRemoveCount
		}個Buff`;
	}
	if (skillEffect.$type == "BattleModel.AmrBreakSkillEffect") {
		const obj = skillEffect as AmrBreakSkillEffect;
		return `破甲(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			obj._skillModifier._ratio,
			NumericSkillEffect.BreakArmorCoefficient,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.AmrReduceSkillEffect") {
		const obj = skillEffect as AmrReduceSkillEffect;
		return `破甲(${constantStringify(obj._skillModifier._parameter)} x${
			obj._skillModifier._ratio
		})`;
	}
	if (skillEffect.$type == "BattleModel.AmrReduceRatioSkillEffect") {
		const obj = skillEffect as AmrReduceRatioSkillEffect;
		return `破甲(${constantStringify(obj._skillModifier._parameter)} x${
			obj._skillModifier._ratio * 100
		}%)`;
	}
	if (skillEffect.$type == "BattleModel.AmrBreakDrainSkillEffect") {
		const obj = skillEffect as AmrBreakDrainSkillEffect;
		return `破甲吸血攻擊(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			numMultiply(obj._skillModifier._ratio, NumericSkillEffect.BreakArmorCoefficient),
			obj._drainRatio,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.HpDamageSkillEffect") {
		const obj = skillEffect as HpDamageSkillEffect;
		return `攻擊(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			obj._skillModifier._ratio,
			NumericSkillEffect.DamageCoefficient,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.HpDamageRatioMaxSkillEffect") {
		const obj = skillEffect as HpDamageRatioMaxSkillEffect;
		return `攻擊(最大血量的${constantStringify(obj._skillModifier._parameter)} x${
			obj._skillModifier._ratio * 100
		}%)`;
	}
	if (skillEffect.$type == "BattleModel.HpDamageRatioCurrentSkillEffect") {
		const obj = skillEffect as HpDamageRatioCurrentSkillEffect;
		return `攻擊(目前血量的${constantStringify(obj._skillModifier._parameter)} x${
			obj._skillModifier._ratio * 100
		}%)`;
	}
	if (skillEffect.$type == "BattleModel.HpDamageDrainSkillEffect") {
		const obj = skillEffect as HpDamageDrainSkillEffect;
		return `吸血攻擊(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			numMultiply(obj._skillModifier._ratio, NumericSkillEffect.DamageCoefficient),
			obj._drainRatio,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.HpHealSkillEffect") {
		const obj = skillEffect as HpHealSkillEffect;
		return `治療(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			obj._skillModifier._ratio,
			NumericSkillEffect.HealCoefficient,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.TrueDamageSkillEffect") {
		const obj = skillEffect as TrueDamageSkillEffect;
		return `穿透(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			obj._skillModifier._ratio,
			NumericSkillEffect.DamageCoefficient,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.AmrGainSkillEffect") {
		const obj = skillEffect as AmrGainSkillEffect;
		return `疊盾(${constantStringify(obj._skillModifier._parameter)} x${numMultiply(
			obj._skillModifier._ratio,
			NumericSkillEffect.ArmorCoefficient,
		)})`;
	}
	if (skillEffect.$type == "BattleModel.ChangeCDSkillEffect") {
		const obj = skillEffect as ChangeCDSkillEffect;
		return `冷卻時間加${obj._value}`;
	}
	if (skillEffect.$type == "BattleModel.SetCDSkillEffect") {
		const obj = skillEffect as SetCDSkillEffect;
		return `冷卻時間改為${constantStringify(obj._integer)}`;
	}
	if (skillEffect.$type == "BattleModel.ChangeReviveCountSkillEffect") {
		const obj = skillEffect as ChangeReviveCountSkillEffect;
		return `復活魂芯${obj.Value >= 0 ? `減少${obj.Value}` : `增加${obj.Value * -1}`}個`;
	}
	if (skillEffect.$type == "BattleModel.StoneActionSkillEffect") {
		const obj = skillEffect as StoneActionSkillEffect;
		return `將${obj._stoneAction.targetStoneCount}個${Constraint.toString(
			obj._stoneAction.filter,
		)}${BoardModificationStoneAction.ChangeType.toString(obj._stoneAction.changeTo)}`;
	}
	if (skillEffect.$type == "BattleModel.StoneBuffSkillEffect") {
		const obj = skillEffect as StoneBuffSkillEffect;
		return `將${obj._stoneBuffAction.targetStoneCount}個${Constraint.toString(
			obj._stoneBuffAction.filter,
		)}由${StoneBuffAction.Order.toString(
			obj._stoneBuffAction.order,
		)}的順序${StoneBuffAction.BuffChangeType.toString(obj._stoneBuffAction.action)}${addBuff(
			obj._stoneBuffAction.buff,
		)}`;
	}
	if (skillEffect.$type == "BattleModel.ReviveSkillEffect") {
		const obj = skillEffect as ReviveSkillEffect;
		return `復活(體力:${obj.ReviveTargetBlood}${obj.RecoverBloodInPercentage ? "%" : ""};疊盾:${
			obj.ReviveTargetArmor
		}${obj.RecoverArmorInPercentage ? "%" : ""})`;
	}
	if (skillEffect.$type == "BattleModel.ChangeTireSkillEffect") {
		const obj = skillEffect as ChangeTireSkillEffect;
		const n = constantStringify(obj._value);
		return `精神值${Number(n) < 0 ? "" : "+"}${n}`;
	}
	if (skillEffect.$type == "BattleModel.ChangeHungerSkillEffect") {
		const obj = skillEffect as ChangeHungerSkillEffect;
		const n = constantStringify(obj._value);
		return `飽食度${Number(n) < 0 ? "" : "+"}${n}`;
	}
	if (skillEffect.$type == "BattleModel.ChangeExploreFlagSkillEffect") {
		const obj = skillEffect as ChangeExploreFlagSkillEffect;
		return `將探索flag:${obj._flagId}${NumberOperation.toString(
			obj._operation,
		)}${constantStringify(obj._value)}`;
	}
	if (skillEffect.$type == "BattleModel.SummonEnemySkillEffect") {
		const obj = skillEffect as SummonEnemySkillEffect;
		return `召喚敵人(${summonStringify(obj.Reference)})`;
	}
	if (skillEffect.$type == "BattleModel.CopyBuffFromCharacterSkillEffect") {
		const obj = skillEffect as CopyBuffFromCharacterSkillEffect;
		if (obj.CopyAllBuff) {
			return `複製${singleTargetStringify(obj.SingleCharacter)}的所有狀態`;
		}
		if (
			obj.FilterCondition &&
			obj.FilterCondition.$type == "BattleModel.CheckBuffMatchBuffId"
		) {
			const condition = obj.FilterCondition as CheckBuffMatchBuffId;
			return `複製${singleTargetStringify(obj.SingleCharacter)}的${localizationBuffName(true)(
				condition.subString,
			)}狀態`;
		}
		return `複製${singleTargetStringify(obj.SingleCharacter)}符合(${conditionBuffStringify(
			obj.FilterCondition,
		)})條件${
			obj.RandomSelectBuff
				? `並隨機選擇${obj.RandomCopyCount}個${obj.NotRepeatSameBuffId ? "不重複的" : ""}`
				: "的"
		}狀態`;
	}
	console.error(`Unknown BaseSkillEffect type: ${skillEffect.$type}`);
	return JSON.stringify(skillEffect);
}

export function addBuff(buff: AddBuffData): string {
	return `賦予${
		buff.Forever || buff.OverwriteDuration < 0 ? "永久" : `${buff.OverwriteDuration}回合`
	}${buff.LevelStack > 0 ? `${buff.LevelStack}層` : ""}${localizationBuffName(true)(
		buff.BuffId,
	)}`;
}
