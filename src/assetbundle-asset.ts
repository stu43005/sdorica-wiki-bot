import path from "node:path";
import { ASSETBUNDLE_PATH, ASSET_HOSTNAME } from "./config";
import { SetFile } from "./out-set-file";
import { MapFile } from "./out-map-file";

export const IMAGE_FORMAT = "webp";
const imageExtensions = [".png", ".jpg", ".psd", ".bmp", ".tga"];

export const uploadedAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "uploaded_assets.json")
);
export const needUploadAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "need_upload_assets.json")
);
export const ignoredAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "ignored_assets.json")
);

export type AssetbundleMappingItem = {
	bundleName: string;
	uuid: string;
	url: string;
};
export const assetbundleMapping = new MapFile<AssetbundleMappingItem>(
	path.join(ASSETBUNDLE_PATH, "mapping.json")
);
export const prefabMappingSprite = new MapFile<{
	fileId: number;
	pathId: string;
}>(path.join(ASSETBUNDLE_PATH, "prefab_mapping_sprite.json"));
export const pathIdMappingContainer = new MapFile<string>(
	path.join(ASSETBUNDLE_PATH, "pathid_mapping_container.json")
);

export function getAssetPath(containerPath: string): string {
	const extname = path.extname(containerPath);
	switch (true) {
		case imageExtensions.includes(extname):
			containerPath = containerPath.replace(new RegExp(`\\${extname}$`), `.${IMAGE_FORMAT}`);
			break;
		case containerPath.endsWith(".prefab"): {
			const spritePtr = prefabMappingSprite.get(containerPath);
			if (spritePtr) {
				const spriteContainerPath = pathIdMappingContainer.get(spritePtr.pathId);
				if (spriteContainerPath) {
					return getAssetPath(spriteContainerPath);
				}
			}
			return "";
		}
	}
	return containerPath;
}

export function getAssetUrl(containerPath: string): string {
	containerPath = containerPath.toLowerCase();
	addAsset(containerPath);
	const assetPath = getAssetPath(containerPath);
	if (assetPath) {
		return new URL(assetPath, ASSET_HOSTNAME).toString();
	}
	return "";
}

export function addAsset(containerPath: string) {
	if (!uploadedAssets.has(containerPath)) {
		needUploadAssets.add(containerPath);
	}
}
