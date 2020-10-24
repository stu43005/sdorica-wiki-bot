export interface AssetDataRaw {
	/**
	 * MD5 Hash
	 */
	H: string;
	/**
	 * UUID
	 */
	I: string;
	/**
	 * URL Link
	 */
	L: string;
	/**
	 * Size
	 */
	B: number;
}

export interface TableDataRaw {
	/**
	 * Columns name
	 */
	K: string[];
	/**
	 * Columns Type
	 */
	T: string[];

	/**
	 * Raw Data
	 */
	D: any[][];
}

export interface ImperiumDataRaw {
	/**
	 * Assets data
	 */
	A: Record<string, AssetDataRaw>;

	/**
	 * Tables data
	 */
	C: Record<string, TableDataRaw>;

	/**
	 * Enums data
	 */
	E: Record<string, string[]>;

	D: string;

	filename: string;
	priv: string;
}

export interface LatestDataRaw {
	/**
	 * CreatedAt
	 */
	CT: number;
	"CT(ISO)": string;

	/**
	 * UUID
	 */
	I: string;

	/**
	 * PublishedAt
	 */
	PT: number;
	"PT(ISO)": string;

	/**
	 * RevisionID
	 */
	R: number;

	filename: string;
}

export type DataRaw = ImperiumDataRaw | LatestDataRaw | Record<string, any>;

export interface CharAssetsRaw {
	BattleCharacters: Record<string, string>;
	Buffs: Record<string, string>;
}
