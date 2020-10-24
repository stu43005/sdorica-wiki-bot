export type SiContainerMultiSearch = SiContainerSearch[];
export type SiContainerSearch = SiContainerSearchEntry[];

export interface SiContainerSearchEntry {
	asset_bundles: SiContainerSearchAB[];
	id: number;
	name: string;
}

export interface SiContainerSearchAB {
	md5: string;
	name: string;
}
