import { h } from "preact";
import { IMonsterAbility } from "../model/monster-ability.interface";
import { MonsterSkill } from "../model/monster-skill";
import { wikiimageElement } from "./wikiimage";

export interface MonsterSkillIconParams {
	/**
	 * 圖示寬度
	 * @default 25px
	 */
	width?: string | number;
	/**
	 * `text=true` 時將會輸出名稱並包含連結，或是給予自訂文字。
	 * @default true
	 */
	text?: string | true;
	/**
	 * 是否顯示層數
	 * @default true
	 */
	showLv?: boolean;
}

export function monsterSkillIconTemplate(
	ability: IMonsterAbility,
	options: MonsterSkillIconParams = {}
): h.JSX.Element {
	options.width ??= 25;
	options.text ??= true;
	options.showLv ??= true;

	const url = ability.getIconAssetUrl();
	let img = url ? (
		wikiimageElement({
			url: url,
			width: options.width,
			props: {
				alt: ability.name,
				title: `${ability.name}：${ability.description}`,
			},
		})
	) : (
		<>[{ability.iconKey}]</>
	);
	const text = options.text === true ? ability.name : options.text;

	if (options.showLv && ability instanceof MonsterSkill) {
		img = (
			<div style="display: inline-block;position: relative;">
				{img}
				<div style="position: absolute;bottom: 0;right: 0;font-size: 12px;font-weight: 600;line-height: 12px;text-shadow: #000000 0 0 6px;color: #ffffff;">
					{ability.skillLv}
				</div>
			</div>
		);
	}
	return (
		<span style="display: inline-table; text-align: left;">
			{img}
			{text ? ` ${text}` : ""}
		</span>
	);
}
