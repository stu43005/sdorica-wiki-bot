import _ from "lodash";
import path from "node:path";
import { downloadAsset, extractAssetBundleByContainerPath } from "./assetbundle-downloader";
import { getAssetUrl } from "./assetbundle-filter";
import { ASSETBUNDLE_PATH } from "./config";
import { AssetDataRaw } from "./data-raw-type";
import { ImperiumData } from "./imperium-data";
import { inputJsonDefault, inputJsonSync } from "./input";
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

export enum LookupTableCategory {
	AVGEffectPrefab = "AVGEffectPrefab",
	TierMedalSprite = "TierMedalSprite",
	MainPageImage = "MainPageImage",
	StoreTagIcon = "StoreTagIcon",
	TierMedalPrefab = "TierMedalPrefab",
	RegionMap = "RegionMap",
	SpecialSignInPage = "SpecialSignInPage",
	CharacterPrefab = "CharacterPrefab",
	CharacterAsset = "CharacterAsset",
	CharacterMetagameAsset = "CharacterMetagameAsset",
	MonsterSkillIcon = "MonsterSkillIcon",
	EmotIcon = "EmotIcon",
	EncounterOptionIcon = "EncounterOptionIcon",
	AvgFlagUI = "AvgFlagUI",
	Monster_SpSkillIcon = "Monster_SpSkillIcon",
	ItemIconMid = "ItemIconMid",
	ItemIconSmall = "ItemIconSmall",
	CurrencyIcon = "CurrencyIcon",
	ItemAnimationPrefab = "ItemAnimationPrefab",
	BuffAsset = "BuffAsset",
	UIOffset_Character = "UIOffset_Character",
	VFXPrefab = "VFXPrefab",
	CharacterAutograph = "CharacterAutograph",
	CharacterImage_AVATAR = "CharacterImage_AVATAR",
	CharacterImage_MID = "CharacterImage_MID",
	CharacterImage_LARGE = "CharacterImage_LARGE",
	CharacterPortrait_LARGE = "CharacterPortrait_LARGE",
	CharacterPortrait = "CharacterPortrait",
	CharacterImage_SD = "CharacterImage_SD",
	CharacterTotem_MID = "CharacterTotem_MID",
	MetagameSpine = "MetagameSpine",
	CutsceneSequence = "CutsceneSequence",
	CutsceneActor = "CutsceneActor",
	LevelData_LevelScenePrefab = "LevelData_LevelScenePrefab",
	CutsceneDialogAsset = "CutsceneDialogAsset",
	Audio_Music = "Audio_Music",
	Audio_SFX = "Audio_SFX",
	LevelData_Actor = "LevelData_Actor",
	LevelData_Event = "LevelData_Event",
	LevelData_WaveSet = "LevelData_WaveSet",
	LevelData_EnemySet = "LevelData_EnemySet",
	EncounterObject = "EncounterObject",
	UIOffset_Monster = "UIOffset_Monster",
	MonsterImage_SD = "MonsterImage_SD",
	VideoObject = "VideoObject",
	BattleField_SD = "BattleField_SD",
	MetagameSequence = "MetagameSequence",
	MetagameSequenceAsset = "MetagameSequenceAsset",
	TutorialArchive = "TutorialArchive",
	DynamicView = "DynamicView",
	Scene = "Scene",
	SpriteAtlas = "SpriteAtlas",
}

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
