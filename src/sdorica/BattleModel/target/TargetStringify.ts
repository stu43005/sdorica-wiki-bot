import { conditionCharStringify, conditionStringify } from "../condition/ConditionStringify";
import { constantCharStringify, constantStringify } from "../constant/ConstantStringify";
import { SkillUnit } from "../SkillUnit";
import { IGroupedCharacter } from "./IGroupedCharacter";
import { ISingleCharacter } from "./ISingleCharacter";
import { CharGroupWhere } from "./multi/CharGroupWhere";
import { CharGroupWhereM } from "./multi/CharGroupWhereM";
import { OppositeTeamChars } from "./multi/OppositeTeamChars";
import { PVEEnemyTeam } from "./multi/PVEEnemyTeam";
import { PVEPlayerTeam } from "./multi/PVEPlayerTeam";
import { SelfTeamChars } from "./multi/SelfTeamChars";
import { SelfTeamDeadChars } from "./multi/SelfTeamDeadChars";
import { SelftTeamEmptySlots } from "./multi/SelftTeamEmptySlots";
import { SlicedCharGroup } from "./multi/SlicedCharGroup";
import { ThisSkillEffectTargets } from "./multi/ThisSkillEffectTargets";
import { UnionCharGroup } from "./multi/UnionCharGroup";
import { BackOfChars } from "./single/BackOfChars";
import { CurrentOperateTarget } from "./single/CurrentOperateTarget";
import { DeadOrReviveTarget } from "./single/DeadOrReviveTarget";
import { EnemyAssignee } from "./single/EnemyAssignee";
import { FieldMaxChar } from "./single/FieldMaxChar";
import { FieldMinChar } from "./single/FieldMinChar";
import { FriendAssignee } from "./single/FriendAssignee";
import { FrontOfChars } from "./single/FrontOfChars";
import { IndexOfChars } from "./single/IndexOfChars";
import { RandomOfChars } from "./single/RandomOfChars";
import { ThisBuffCaster } from "./single/ThisBuffCaster";
import { ThisBuffOwner } from "./single/ThisBuffOwner";
import { ThisSkillCaster } from "./single/ThisSkillCaster";
import { ThisSpecifiedTarget } from "./single/ThisSpecifiedTarget";
import { ThisSummonedTarget } from "./single/ThisSummonedTarget";
import { TargetResolver } from "./TargetResolver";

export function targetResolve(unit: SkillUnit | TargetResolver) {
	if (unit.IsMultiple && unit.multi) {
		return `對${mulitTargetStringify(unit.multi)}全體`;
	}
	else if (unit.single) {
		return `對${singleTargetStringify(unit.single)}`;
	}
	return "";
}

export function singleTargetStringify(target: ISingleCharacter): string {
	if (!target) return "";
	if (target.$type == "BattleModel.EnemyAssignee") {
		const obj = target as EnemyAssignee;
		return `${singleTargetStringify(obj.reference)}的目標`;
	}
	if (target.$type == "BattleModel.FriendAssignee") {
		const obj = target as FriendAssignee;
		return `${singleTargetStringify(obj.reference)}的友方指定對象`;
	}
	if (target.$type == "BattleModel.FrontOfChars") {
		const obj = target as FrontOfChars;
		return `${mulitTargetStringify(obj.group)}首位`;
	}
	if (target.$type == "BattleModel.BackOfChars") {
		const obj = target as BackOfChars;
		return `${mulitTargetStringify(obj.group)}後排`;
	}
	if (target.$type == "BattleModel.RandomOfChars") {
		const obj = target as RandomOfChars;
		return `${mulitTargetStringify(obj.group)}的隨機角色`;
	}
	if (target.$type == "BattleModel.IndexOfChars") {
		const obj = target as IndexOfChars;
		const index = constantStringify(obj.index);
		return `${mulitTargetStringify(obj.group)}的${obj.backward ? "" : "倒數"}第${isNaN(Number(index)) ? `${index}+1` : Number(index) + 1}個角色`;
	}
	if (target.$type == "BattleModel.ThisBuffCaster") {
		const obj = target as ThisBuffCaster;
		return `賦予者`;
	}
	if (target.$type == "BattleModel.ThisBuffOwner") {
		const obj = target as ThisBuffOwner;
		return `本角色`;
	}
	if (target.$type == "BattleModel.ThisSkillCaster") {
		const obj = target as ThisSkillCaster;
		return `施術者`;
	}
	if (target.$type == "BattleModel.ThisSpecifiedTarget") {
		const obj = target as ThisSpecifiedTarget;
		return `指定目標`;
	}
	if (target.$type == "BattleModel.ThisSummonedTarget") {
		const obj = target as ThisSummonedTarget;
		return `召喚的目標`;
	}
	if (target.$type == "BattleModel.DeadOrReviveTarget") {
		const obj = target as DeadOrReviveTarget;
		return `死亡或復活的角色`;
	}
	if (target.$type == "BattleModel.CurrentOperateTarget") {
		const obj = target as CurrentOperateTarget;
		return `目前操作目標`;
	}
	if (target.$type == "BattleModel.FieldMinChar") {
		const obj = target as FieldMinChar;
		return `${mulitTargetStringify(obj.group)}中${constantCharStringify(obj.field)}最低的角色`;
	}
	if (target.$type == "BattleModel.FieldMaxChar") {
		const obj = target as FieldMaxChar;
		return `${mulitTargetStringify(obj.group)}中${constantCharStringify(obj.field)}最高的角色`;
	}
	console.error(`Unknown target type: ${target.$type}`);
	debugger;
	return JSON.stringify(target);
}

export function mulitTargetStringify(target: IGroupedCharacter): string {
	if (!target) return "";
	if (target.$type == "BattleModel.PVEEnemyTeam") {
		const obj = target as PVEEnemyTeam;
		return `敵人`;
	}
	if (target.$type == "BattleModel.PVEPlayerTeam") {
		const obj = target as PVEPlayerTeam;
		return `玩家`;
	}
	if (target.$type == "BattleModel.ThisSkillEffectTargets") {
		const obj = target as ThisSkillEffectTargets;
		return `此技能效果目標`;
	}
	if (target.$type == "BattleModel.SelfTeamChars") {
		const obj = target as SelfTeamChars;
		return `${singleTargetStringify(obj.reference)}的隊伍`;
	}
	if (target.$type == "BattleModel.SelfTeamDeadChars") {
		const obj = target as SelfTeamDeadChars;
		return `${singleTargetStringify(obj.reference)}隊伍的死亡角色`;
	}
	if (target.$type == "BattleModel.OppositeTeamChars") {
		const obj = target as OppositeTeamChars;
		return `${singleTargetStringify(obj.reference)}的對方`;
	}
	if (target.$type == "BattleModel.CharGroupWhere") {
		const obj = target as CharGroupWhere;
		return `${mulitTargetStringify(obj.group)}中符合(${conditionCharStringify(obj.condition)})的角色`;
	}
	if (target.$type == "BattleModel.CharGroupWhereM") {
		const obj = target as CharGroupWhereM;
		return `${mulitTargetStringify(obj.group)}中符合(${conditionStringify(obj.condition)})的角色`;
	}
	if (target.$type == "BattleModel.UnionCharGroup") {
		const obj = target as UnionCharGroup;
		return `${mulitTargetStringify(obj.group1)}及${mulitTargetStringify(obj.group2)}`;
	}
	if (target.$type == "BattleModel.SlicedCharGroup") {
		const obj = target as SlicedCharGroup;
		const backward = obj.backward ? "倒數" : "";
		if (obj.count == 1) {
			return `${mulitTargetStringify(obj.group)}的${backward}第${obj.fromIndex + 1}個角色`;
		}
		return `${mulitTargetStringify(obj.group)}的${backward}第${obj.fromIndex + 1}個到第${obj.fromIndex + obj.count}個角色`;
	}
	if (target.$type == "BattleModel.SelftTeamEmptySlots") {
		const obj = target as SelftTeamEmptySlots;
		return `${singleTargetStringify(obj.reference)}隊伍的空位`;
	}
	console.error(`Unknown target type: ${target.$type}`);
	debugger;
	return JSON.stringify(target);
}
