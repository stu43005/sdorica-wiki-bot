export enum TransitionValueType {
	HpDamage = "HpDamage",
	ArmorReduce = "ArmorReduce",
	Heal = "Heal",
	GainArmor = "GainArmor",
}

export namespace TransitionValueType {
	export function toString(f: TransitionValueType) {
		switch (f) {
			case TransitionValueType.HpDamage:
				return "減少體力";
			case TransitionValueType.ArmorReduce:
				return "減少疊盾";
			case TransitionValueType.Heal:
				return "補血量";
			case TransitionValueType.GainArmor:
				return "疊盾量";
		}
		return TransitionValueType[f] || f;
	}
}
