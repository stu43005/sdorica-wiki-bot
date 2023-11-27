import _ from "lodash";
import path from "node:path";
import { getAssetUrl } from "./assetbundle-asset";
import { downloadAsset, extractAssetBundleByContainerPath } from "./assetbundle-downloader";
import { ASSETBUNDLE_PATH } from "./config";
import { AssetDataRaw } from "./data-raw-type";
import { ImperiumData } from "./imperium-data";
import { inputJsonDefault, inputJsonSync } from "./input";
import { LookupTableCategory } from "./model/enums/lookup-table-category.enum";
import { outJson } from "./out";
import { ResourceFile } from "./out-resource-file";

const lookupTablePath = path.join(ASSETBUNDLE_PATH, "assetbundleLookupTable.json");

type LookupTable = Record<
	string,
	Record<
		string,
		{
			BundleName: string;
			AssetName: string;
		}
	>
> & {
	"@asset"?: AssetDataRaw;
};

export class AssetbundleLookupTable extends ResourceFile<LookupTable> {
	private static instance: AssetbundleLookupTable | undefined;
	public static getInstance() {
		if (!this.instance) {
			this.instance = new AssetbundleLookupTable();
		}
		return this.instance;
	}

	private constructor() {
		super("assetbundleLookupTable");
	}

	protected loadData(): LookupTable {
		try {
			return inputJsonSync(lookupTablePath);
		} catch (error) {}
		return {};
	}

	protected async cleanupData(data: LookupTable): Promise<void> {
		this.logger.info(`Saving file...: ${lookupTablePath}`);
		await outJson(lookupTablePath, data);
	}

	public async updateLookupTable(force = false) {
		const metaAsset = this.data["@asset"];
		const android = ImperiumData.from("android");
		const name = "assetbundle_lookup_table.ab";
		const asset = android.getAsset(name);
		if (asset && (force || metaAsset?.H !== asset.H)) {
			const abFilePath = await downloadAsset(name, asset.L);
			const outLookupTablePath = await extractAssetBundleByContainerPath(
				name,
				abFilePath,
				"assets/assetbundleLookupTable.json"
			);
			if (outLookupTablePath) {
				const outLookupTable = await inputJsonDefault<LookupTable>(outLookupTablePath, {});
				_.extend(this.data, outLookupTable);
			}
			this.data["@asset"] = asset;
			this.changed = true;
		}
	}

	public getCategoryAssets(category: LookupTableCategory): string[] {
		const cate = this.data[category];
		return Object.values(cate).map((item) => item.AssetName.toLowerCase());
	}

	public getContainerPath(category: LookupTableCategory, key: string): string {
		return this.data[category][key].AssetName.toLowerCase();
	}

	public getAssetUrl(category: LookupTableCategory, key: string): string {
		const containerPath = this.getContainerPath(category, key);
		return getAssetUrl(containerPath);
	}
}
