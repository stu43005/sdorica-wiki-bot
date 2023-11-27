import { minimatch } from "minimatch";
import { addAsset, needUploadAssets, uploadedAssets } from "./assetbundle-asset";
import { AssetbundleLookupTable } from "./assetbundle-lookup-table";
import { AssetbundleMapping, AssetbundleMappingItem } from "./assetbundle-mapping";
import { LookupTableCategory } from "./model/enums/lookup-table-category.enum";

const uploadGlobs: string[] = ["assets/game/character/character_image/**/*.@(png|jpg|bmp|tga|psd)"];
const uploadCategories: LookupTableCategory[] = [
	LookupTableCategory.AvgFlagUI,
	LookupTableCategory.BattleField_SD,
	LookupTableCategory.CharacterAutograph,
	LookupTableCategory.CharacterImage_AVATAR,
	LookupTableCategory.CharacterImage_LARGE,
	LookupTableCategory.CharacterImage_MID,
	LookupTableCategory.CharacterImage_SD,
	LookupTableCategory.CharacterPortrait,
	LookupTableCategory.CharacterPortrait_LARGE,
	LookupTableCategory.CharacterTotem_MID,
	LookupTableCategory.CurrencyIcon,
	LookupTableCategory.EncounterOptionIcon,
	LookupTableCategory.ItemIconMid,
	LookupTableCategory.ItemIconSmall,
	LookupTableCategory.Monster_SpSkillIcon,
	LookupTableCategory.MonsterImage_SD,
	LookupTableCategory.MonsterSkillIcon,
	LookupTableCategory.StoreTagIcon,
	LookupTableCategory.TierMedalSprite,
];

export function updateNeedUpdateList() {
	for (const cate of uploadCategories) {
		const assets = AssetbundleLookupTable.getInstance().getCategoryAssets(cate);
		for (const containerPath of assets) {
			addAsset(containerPath);
		}
	}
	for (const containerPath of AssetbundleMapping.getInstance().keys()) {
		if (uploadedAssets.has(containerPath) || needUploadAssets.has(containerPath)) {
			continue;
		}
		for (const glob of uploadGlobs) {
			if (minimatch(containerPath, glob, { nocase: true })) {
				addAsset(containerPath);
				break;
			}
		}
	}
}

export function filterAsset(containerPath: string): boolean {
	if (uploadedAssets.has(containerPath)) {
		return true;
	}
	if (needUploadAssets.has(containerPath)) {
		return true;
	}
	for (const glob of uploadGlobs) {
		if (minimatch(containerPath, glob, { nocase: true })) {
			return true;
		}
	}
	return false;
}

export function getNeedUploadBundleList() {
	const bundles = new Map<
		string,
		{
			mapping: AssetbundleMappingItem;
			containerPaths: Set<string>;
		}
	>();
	for (const containerPath of needUploadAssets.values()) {
		const mapping = AssetbundleMapping.getInstance().get(containerPath);
		if (mapping) {
			const bundle = bundles.get(mapping.url);
			if (bundle) {
				bundle.containerPaths.add(containerPath);
			} else {
				bundles.set(mapping.url, {
					mapping: mapping,
					containerPaths: new Set([containerPath]),
				});
			}
		}
	}
	return bundles;
}
