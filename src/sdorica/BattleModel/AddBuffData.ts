export interface AddBuffData {
	BuffId: string;
	OverwriteDuration: number;
	Forever: boolean;
	LevelStack: number;

	// TODO: Record<string, any>
	UserDefineVariable: any;
}
