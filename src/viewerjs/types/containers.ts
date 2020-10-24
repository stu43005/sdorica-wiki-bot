export type SiContainer = Record<string, any>;
export type SiContainers = Record<string, SiContainersEntry>;

export interface SiContainersEntry {
	name: string;
	type: string;
}
