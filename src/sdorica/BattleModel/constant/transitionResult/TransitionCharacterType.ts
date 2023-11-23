export enum TransitionCharacterType {
	Sender = "Sender",
	Target = "Target",
}

export namespace TransitionCharacterType {
	export function toString(f: TransitionCharacterType) {
		switch (f) {
			case TransitionCharacterType.Sender:
				return "施術者";
			case TransitionCharacterType.Target:
				return "目標";
		}
		return TransitionCharacterType[f] || f;
	}
}
