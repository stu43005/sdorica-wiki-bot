import picomatch from "picomatch";
import {
	AssetbundleMappingItem,
	addAsset,
	assetbundleMapping,
	needUploadAssets,
	pathIdMappingContainer,
	prefabMappingSprite,
	uploadedAssets,
} from "./assetbundle-asset.js";
import { AssetbundleLookupTable } from "./assetbundle-lookup-table.js";
import { LookupTableCategory } from "./model/enums/custom/lookup-table-category.enum.js";

const globImageExt = "@(png|jpg|bmp|tga|psd)";
const uploadGlobs: string[] = [
	`assets/game/character/character_image/**/*.${globImageExt}`,
	`assets/game/character/spinedata/**/*.@(png|atlas.txt|skel.bytes)`,
	`assets/game/ui/common/itemicon/**/*.${globImageExt}`,
	`assets/game/ui/metagame/mainpagepanel/covertexture/**/*.${globImageExt}`,
	// `assets/game/ui/levelscene/stonepanel/texture/**/*.${globImageExt}`,
	`assets/game/ui/loadingscene/loadingbg/**/*.${globImageExt}`,
];
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
	LookupTableCategory.MainPageImage,
];

export function updateNeedUpdateList() {
	for (const cate of uploadCategories) {
		const assets = AssetbundleLookupTable.getInstance().getCategoryAssets(cate);
		for (const containerPath of assets) {
			addAsset(containerPath);
		}
	}
	for (const containerPath of assetbundleMapping.keys()) {
		if (uploadedAssets.has(containerPath) || needUploadAssets.has(containerPath)) {
			continue;
		}
		for (const glob of uploadGlobs) {
			if (picomatch.isMatch(containerPath, glob, { nocase: true })) {
				addAsset(containerPath);
				break;
			}
		}
	}
	for (const ref of prefabMappingSprite.values()) {
		const containerPath = pathIdMappingContainer.get(ref.pathId);
		if (containerPath) {
			addAsset(containerPath);
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
		if (picomatch.isMatch(containerPath, glob, { nocase: true })) {
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
		const mapping = assetbundleMapping.get(containerPath);
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
