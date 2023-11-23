export namespace BuffEnums {
	export enum CharacterIntegerField {
		HP, // 0
		MaxHP, // 1
		HpPercent, // 2
		InverseHpPercent, // 3
		Armor, // 4
		MaxArmor, // 5
		ArmorPercent, // 6
		InverseArmorPercent, // 7
		BasePower, // 8
		FullPower, // 9
		EnemyRank, // 10
		CoolDown, // 11
		// TODO: 12,13 ??
	}

	export namespace CharacterIntegerField {
		export function toString(f: CharacterIntegerField) {
			switch (f) {
				case CharacterIntegerField.HP:
					return "HP";
				case CharacterIntegerField.MaxHP:
					return "最大HP";
				case CharacterIntegerField.HpPercent:
					return "HP%";
				case CharacterIntegerField.InverseHpPercent:
					return "失去的HP%";
				case CharacterIntegerField.Armor:
					return "疊盾";
				case CharacterIntegerField.MaxArmor:
					return "最大疊盾";
				case CharacterIntegerField.ArmorPercent:
					return "疊盾%";
				case CharacterIntegerField.InverseArmorPercent:
					return "失去的疊盾%";
				case CharacterIntegerField.BasePower:
					return "攻擊力";
				case CharacterIntegerField.FullPower:
					break;
				case CharacterIntegerField.EnemyRank:
					break;
				case CharacterIntegerField.CoolDown:
					return "CD";
			}
			return CharacterIntegerField[f] || f;
		}
	}

	export enum BuffIntergerField {
		Duration = 0,
		Level = 1,
		CoolDown = 2,
		UserDefined1 = 4,
		UserDefined2 = 8,
		UserDefined3 = 16, // 0x00000010
		UserDefined4 = 32, // 0x00000020
		UserDefined5 = 64, // 0x00000040
	}

	export namespace BuffIntergerField {
		export function toString(f: BuffIntergerField) {
			switch (f) {
				case BuffIntergerField.Duration:
					return "持續時間";
				case BuffIntergerField.Level:
					return "層數";
				case BuffIntergerField.CoolDown:
					return "冷卻時間";
				case BuffIntergerField.UserDefined1:
					return "變數一";
				case BuffIntergerField.UserDefined2:
					return "變數二";
				case BuffIntergerField.UserDefined3:
					return "變數三";
				case BuffIntergerField.UserDefined4:
					return "變數四";
				case BuffIntergerField.UserDefined5:
					return "變數五";
			}
			return BuffIntergerField[f] || f;
		}
	}

	export enum SetterOp {
		Overwrite,
		Plus,
		Module,
	}

	export namespace SetterOp {
		export function toString(op: SetterOp) {
			switch (op) {
				case SetterOp.Overwrite:
					return "改為";
				case SetterOp.Plus:
					return "增加";
				case SetterOp.Module:
					return "取模";
			}
			return SetterOp[op] || op;
		}
	}
}
