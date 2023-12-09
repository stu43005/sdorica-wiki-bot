import { localizationBuffName } from "../../../localization.js";
import { BuffLabelData } from "../BuffLabelData.js";
import { conditionBuffStringify } from "../condition/ConditionStringify.js";
import { singleTargetStringify } from "../target/TargetStringify.js";
import { BuffIdFromLabelList } from "./buffid/BuffIdFromLabelList.js";
import { GeneralGroupedBuffId } from "./buffid/GeneralGroupedBuffId.js";
import { IGroupedBuffId } from "./buffid/IGroupedBuffId.js";
import { AllBuffsOnChar } from "./grouped/AllBuffsOnChar.js";
import { BuffGroupWhere } from "./grouped/BuffGroupWhere.js";
import { IGroupedBuff } from "./grouped/IGroupedBuff.js";
import { BuffOnCharater } from "./single/BuffOnCharater.js";
import { ISingleBuff } from "./single/ISingleBuff.js";
import { SpecifiedBuff } from "./single/SpecifiedBuff.js";
import { ThisBuff } from "./single/ThisBuff.js";

export function singleBuffStringify(buff: ISingleBuff) {
	if (!buff) return "";
	if (buff.$type == "BattleModel.ThisBuff") {
		const obj = buff as ThisBuff;
		return `本狀態`;
	}
	if (buff.$type == "BattleModel.SpecifiedBuff") {
		const obj = buff as SpecifiedBuff;
		return `當前事件的狀態`;
	}
	if (buff.$type == "BattleModel.BuffOnCharater") {
		const obj = buff as BuffOnCharater;
		return `在${singleTargetStringify(obj.character)}的${localizationBuffName(true)(
			obj.buffId,
		)}狀態`;
	}
	console.error(`Unknown ISingleBuff type: ${buff.$type}`);
	return JSON.stringify(buff);
}

export function groupedBuffStringify(buff: IGroupedBuff): string {
	if (!buff) return "";
	if (buff.$type == "BattleModel.AllBuffsOnChar") {
		const obj = buff as AllBuffsOnChar;
		return `${singleTargetStringify(obj.character)}持有的Buff`;
	}
	if (buff.$type == "BattleModel.BuffGroupWhere") {
		const obj = buff as BuffGroupWhere;
		return `${groupedBuffStringify(obj.group)}中${conditionBuffStringify(obj.condition)}的Buff`;
	}
	console.error(`Unknown IGroupedBuff type: ${buff.$type}`);
	return JSON.stringify(buff);
}

export function groupedBuffIdStringify(buff: IGroupedBuffId) {
	if (!buff) return "";
	if (buff.$type == "BattleModel.BuffIdFromLabelList") {
		const obj = buff as BuffIdFromLabelList;
		return `${buffLabelStringify(obj.BuffLabel)}列表的Buff`;
	}
	if (buff.$type == "BattleModel.GeneralGroupedBuffId") {
		const obj = buff as GeneralGroupedBuffId;
		return groupedBuffStringify(obj.BuffGroup);
	}
	console.error(`Unknown IGroupedBuffId type: ${buff.$type}`);
	return JSON.stringify(buff);
}

export function buffLabelStringify(buffLabel: BuffLabelData) {
	const buffList = buffLabel.BuffIdList.map((b) => localizationBuffName()(b));
	let prefix = "";
	let separator = ", ";
	let suffix = "";
	if (buffList.some((value) => value.length > 10)) {
		prefix = "\n\t";
		separator = ",\n\t";
		suffix = "\n";
	}
	return `${buffLabel.BuffLabel}[${prefix}${buffList.join(separator)}${suffix}]`;
}
