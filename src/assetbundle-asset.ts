import path from "node:path";
import { ASSETBUNDLE_PATH, ASSET_HOSTNAME } from "./config";
import { SetFile } from "./out-set-file";

export const IMAGE_FORMAT = "webp";

export const uploadedAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "uploaded_assets.json")
);
export const needUploadAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "need_upload_assets.json")
);
export const ignoredAssets = new SetFile<string>(
	path.join(ASSETBUNDLE_PATH, "ignored_assets.json")
);

export function getAssetPath(containerPath: string): string {
	const extname = path.extname(containerPath);
	switch (extname) {
		case ".png":
		case ".jpg":
		case ".bmp":
		case ".tga":
		case ".psd":
			containerPath = containerPath.replace(new RegExp(`\\${extname}$`), `.${IMAGE_FORMAT}`);
			break;
	}
	return containerPath;
}

export function getAssetUrl(containerPath: string): string {
	containerPath = containerPath.toLowerCase();
	addAsset(containerPath);
	return new URL(getAssetPath(containerPath), ASSET_HOSTNAME).toString();
}

export function addAsset(containerPath: string) {
	if (!uploadedAssets.has(containerPath)) {
		needUploadAssets.add(containerPath);
	}
}
