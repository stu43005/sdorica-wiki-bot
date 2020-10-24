export interface SiDiffData {
	add: Record<string, SiDiffDataSingle>;
	delete: Record<string, SiDiffDataSingle>;
	change: Record<string, SiDiffDataChange>;
	nochange: Record<string, SiDiffMd5Change>;
}

export interface SiDiffDataSingle {
	data: string[];
	md5: string;
}

export interface SiDiffDataChange {
	add: string[];
	delete: string[];
	md5: SiDiffMd5Change;
}

export type SiDiffMd5Change = [string, string];
