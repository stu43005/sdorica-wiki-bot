import path from "node:path";
import { ASSETBUNDLE_PATH } from "./config";
import { AssetDataRaw } from "./data-raw-type";
import { inputJsonSync } from "./input";
import { outJson } from "./out";
import { ResourceFile } from "./out-resource-file";

const mappingFilePath = path.join(ASSETBUNDLE_PATH, "mapping.json");

export type AssetbundleMappingItem = {
	bundleName: string;
	uuid: string;
	url: string;
};
type Mapping = Record<string, AssetbundleMappingItem>;

export class AssetbundleMapping extends ResourceFile<Mapping> {
	private static instance: AssetbundleMapping | undefined;
	public static getInstance() {
		if (!this.instance) {
			this.instance = new AssetbundleMapping();
		}
		return this.instance;
	}

	private constructor() {
		super("assetbundle_mapping");
	}

	protected loadData(): Mapping {
		try {
			return inputJsonSync(mappingFilePath);
		} catch (error) {}
		return {};
	}

	protected async cleanupData(data: Mapping): Promise<void> {
		this.logger.info(`Saving file...: ${mappingFilePath}`);
		await outJson(mappingFilePath, data);
	}

	public set(containerPath: string, bundleName: string, asset: Pick<AssetDataRaw, "I" | "L">) {
		this.data[containerPath] = {
			bundleName: bundleName,
			uuid: asset.I,
			url: asset.L,
		};
		this.changed = true;
	}

	public get(containerPath: string): AssetbundleMappingItem | undefined {
		return this.data[containerPath];
	}

	public keys() {
		return Object.keys(this.data);
	}
}
