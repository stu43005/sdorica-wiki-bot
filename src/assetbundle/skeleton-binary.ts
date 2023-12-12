import { fromRatio } from "@ctrl/tinycolor";
import { BinaryInput, BlendMode, Color } from "@esotericsoftware/spine-core";
import { match } from "ts-pattern";
import { range } from "../utils.js";

export class SkeletonBinary {
	result: any;
	skins: any[] = [];
	nonessential = false;

	constructor(private readonly playerVersion: 3.7 | 4.1) {}

	readSkeletonJson(binary: Uint8Array): any {
		const result = (this.result = Object.create(null));
		const input = new BinaryInput(binary);

		result.skeleton = this.readSkeleton(input);
		result.bones = this.readBones(input);
		result.ik = this.readIkConstraint(input);
		result.transform = this.readTransformConstraint(input);
		result.slots = this.readSlots(input);
		result.skins = this.readSkins(input);
		result.events = this.readEvents(input);
		result.animations = this.readAnimations(input);

		return result;
	}

	private readSkeleton(input: BinaryInput) {
		const skeletonMap = Object.create(null);
		skeletonMap.hash = input.readString();
		skeletonMap.spine = input.readString();
		skeletonMap.width = input.readFloat();
		skeletonMap.height = input.readFloat();
		if (this.playerVersion > 3.7) {
			skeletonMap.x = 0;
			skeletonMap.y = 0;
			skeletonMap.fps = 0;
		}
		this.nonessential = input.readBoolean();
		skeletonMap.images = this.nonessential ? input.readString() : null;
		return skeletonMap;
	}

	private readBones(input: BinaryInput) {
		const list: any[] = [];
		const bonesCount = input.readInt(true);
		for (let i = 0; i < bonesCount; i++) {
			const boneMap = Object.create(null);
			boneMap.name = input.readString();
			boneMap.parent = i == 0 ? null : list[input.readInt(true)].name;
			boneMap.rotation = input.readFloat();
			boneMap.x = input.readFloat();
			boneMap.y = input.readFloat();
			boneMap.scaleX = input.readFloat();
			boneMap.scaleY = input.readFloat();
			boneMap.shearX = input.readFloat();
			boneMap.shearY = input.readFloat();
			boneMap.length = input.readFloat();
			boneMap.inheritRotation = input.readBoolean();
			boneMap.inheritScale = input.readBoolean();
			if (this.nonessential) {
				boneMap.color = this.readRgba8888(input);
			}
			boneMap.transform = match([boneMap.inheritRotation, boneMap.inheritScale] as [
				boolean,
				boolean,
			])
				.with([true, true], () => "normal")
				.with([true, false], () => "noScale")
				.with([false, true], () => "noRotationOrReflection")
				.with([false, false], () => "onlyTranslation")
				.otherwise(() => "normal");
			list.push(boneMap);
		}
		return list;
	}

	private findBone(index: number) {
		return this.result.bones[index].name;
	}

	private readIkConstraint(input: BinaryInput) {
		const list: any[] = [];
		const ikCount = input.readInt(true);
		for (let i = 0; i < ikCount; i++) {
			const constraintMap = Object.create(null);
			constraintMap.name = input.readString();
			const bonesCount = input.readInt(true);
			constraintMap.bones = range(1, bonesCount).map(() =>
				this.findBone(input.readInt(true)),
			);
			constraintMap.target = this.findBone(input.readInt(true));
			constraintMap.mix = input.readFloat();
			constraintMap.bendPositive = input.readByte() === 1;
			constraintMap.order = i;
			list.push(constraintMap);
		}
		return list;
	}

	private findIkConstraint(index: number) {
		return this.result.ik[index].name;
	}

	private readTransformConstraint(input: BinaryInput) {
		const list: any[] = [];
		const transformCount = input.readInt(true);
		for (let i = 0; i < transformCount; i++) {
			const constraintMap = Object.create(null);
			constraintMap.name = input.readString();
			const bone = this.findBone(input.readInt(true));
			constraintMap.bones = [bone];
			constraintMap.target = this.findBone(input.readInt(true));
			constraintMap.rotation = input.readFloat();
			constraintMap.x = input.readFloat();
			constraintMap.y = input.readFloat();
			constraintMap.scaleX = input.readFloat();
			constraintMap.scaleY = input.readFloat();
			constraintMap.shearY = input.readFloat();
			constraintMap.rotateMix = input.readFloat();
			// constraintMap.mixRotate = constraintMap.rotateMix;
			constraintMap.translateMix = input.readFloat();
			// constraintMap.mixX = constraintMap.translateMix;
			constraintMap.scaleMix = input.readFloat();
			// constraintMap.mixScaleX = constraintMap.scaleMix;
			constraintMap.shearMix = input.readFloat();
			// constraintMap.mixShearY = constraintMap.shearMix;
			constraintMap.order = i;
			list.push(constraintMap);
		}
		return list;
	}

	private findTransformConstraint(index: number) {
		return this.result.transform[index].name;
	}

	private readSlots(input: BinaryInput) {
		const list: any[] = [];
		const slotsCount = input.readInt(true);
		for (let i = 0; i < slotsCount; i++) {
			const slotMap = Object.create(null);
			slotMap.name = input.readString();
			slotMap.bone = this.findBone(input.readInt(true));
			slotMap.color = this.readRgba8888(input);
			const attachment = input.readString();
			if (attachment) {
				slotMap.attachment = attachment;
			}
			slotMap.blend = BlendMode[input.readInt(true)].toLowerCase();
			list.push(slotMap);
		}
		return list;
	}

	private findSlot(index: number) {
		return this.result.slots[index].name;
	}

	private readSkins(input: BinaryInput) {
		this.skins = [];
		// Default skin
		const defaultSkin = this.readSkin(input, true);
		if (defaultSkin) {
			this.skins.push(defaultSkin);
		}
		// Skins
		const skinsCount = input.readInt(true);
		for (let i = 0; i < skinsCount; i++) {
			this.skins.push(this.readSkin(input, false));
		}

		if (this.playerVersion > 3.7) {
			// array
			return this.skins;
		} else {
			// dict
			return Object.fromEntries(
				this.skins.map((skin) => [skin.name, skin.attachments] as [string, any]),
			);
		}
	}

	private findSkin(index: number) {
		return this.skins[index].name;
	}

	private readSkin(input: BinaryInput, defaultSkin: boolean) {
		const skinMap = Object.create(null);

		let slotCount = 0;
		if (defaultSkin) {
			skinMap.name = "default";
			slotCount = input.readInt(true);
			if (slotCount == 0) return null;
		} else {
			skinMap.name = input.readString();
			slotCount = input.readInt(true);
		}

		skinMap.attachments = Object.create(null);
		for (let i = 0; i < slotCount; i++) {
			const slotIndex = input.readInt(true);
			const slotName = this.findSlot(slotIndex);
			const slotMap = (skinMap.attachments[slotName] = Object.create(null));

			const attachmentCount = input.readInt(true);
			for (let ii = 0; ii < attachmentCount; ii++) {
				const entryName = input.readString();
				if (!entryName) throw new Error("Attachment name must not be null");
				const attachment = this.readAttachment(input, entryName);
				slotMap[entryName] = attachment;
			}
		}

		return skinMap;
	}

	private readAttachment(input: BinaryInput, attachmentName: string) {
		const attachmentMap = Object.create(null);

		let name = input.readString();
		if (!name) name = attachmentName;
		attachmentMap.name = name;

		const type = input.readByte() as AttachmentType;
		attachmentMap.type = AttachmentType[type].toLowerCase();
		switch (type) {
			case AttachmentType.Region: {
				attachmentMap.path = input.readString();
				attachmentMap.rotation = input.readFloat();
				attachmentMap.x = input.readFloat();
				attachmentMap.y = input.readFloat();
				attachmentMap.scaleX = input.readFloat();
				attachmentMap.scaleY = input.readFloat();
				attachmentMap.width = input.readFloat();
				attachmentMap.height = input.readFloat();
				attachmentMap.color = this.readRgba8888(input);
				break;
			}
			case AttachmentType.BoundingBox: {
				const vertexCount = input.readInt(true);
				// attachmentMap.vertexCount = vertexCount;
				attachmentMap.vertices = this.readVertices(input, vertexCount);
				// attachmentMap.color = this.readRgba8888(input);
				break;
			}
			case AttachmentType.Mesh:
			case AttachmentType.WeightedMesh: {
				if (type === AttachmentType.WeightedMesh) {
					attachmentMap.type = AttachmentType[AttachmentType.Mesh].toLowerCase();
				}
				attachmentMap.path = input.readString();
				attachmentMap.color = this.readRgba8888(input);
				const vertexCount = input.readInt(true);
				// attachmentMap.vertexCount = vertexCount;
				attachmentMap.uvs = this.readFloatArray(input, vertexCount << 1);
				attachmentMap.triangles = this.readShortArray(input);
				if (type === AttachmentType.WeightedMesh) {
					const vertices: number[] = [];
					for (let i = 0; i < vertexCount; i++) {
						let boneCount = input.readFloat();
						vertices.push(boneCount);
						for (let ii = 0; ii < boneCount; ii++) {
							vertices.push(...this.readFloatArray(input, 4));
						}
					}
					attachmentMap.vertices = vertices;
				} else {
					attachmentMap.vertices = this.readVertices(input, vertexCount);
				}
				attachmentMap.hull = input.readInt(true);
				if (this.nonessential) {
					attachmentMap.edges = this.readShortArray(input);
					attachmentMap.width = input.readFloat();
					attachmentMap.height = input.readFloat();
				}
				break;
			}
			case AttachmentType.LinkedMesh:
			case AttachmentType.WeightedLinkedMesh: {
				if (type === AttachmentType.WeightedLinkedMesh) {
					attachmentMap.type = AttachmentType[AttachmentType.LinkedMesh].toLowerCase();
				}
				attachmentMap.path = input.readString();
				attachmentMap.color = this.readRgba8888(input);
				attachmentMap.skin = input.readString();
				attachmentMap.parent = input.readString();
				attachmentMap.deform = input.readBoolean();
				if (this.nonessential) {
					attachmentMap.width = input.readFloat();
					attachmentMap.height = input.readFloat();
				}
			}
		}

		if (!attachmentMap.path) {
			delete attachmentMap.path;
		}

		return attachmentMap;
	}

	private readEvents(input: BinaryInput) {
		const list: any[] = [];
		const eventsCount = input.readInt(true);
		for (let i = 0; i < eventsCount; i++) {
			const eventMap = Object.create(null);
			eventMap.name = input.readString();
			eventMap.int = input.readInt(false);
			eventMap.float = input.readFloat();
			eventMap.string = input.readString();
			list.push(eventMap);
		}
		return list;
	}

	private findEvent(index: number) {
		return this.result.events[index];
	}

	private readAnimations(input: BinaryInput) {
		const animationsMap = Object.create(null);
		const animationsCount = input.readInt(true);
		for (let i = 0; i < animationsCount; i++) {
			const animationName = input.readString();
			if (!animationName) throw new Error("Animation name must not be null.");
			const animation = this.readAnimation(input, animationName);
			animationsMap[animationName] = animation;
		}
		return animationsMap;
	}

	private readAnimation(input: BinaryInput, animationName: string) {
		const animationMap = Object.create(null);

		// slot timelines
		animationMap.slots = Object.create(null);
		const slotsCount = input.readInt(true);
		for (let i = 0; i < slotsCount; i++) {
			const slotIndex = input.readInt(true);
			const slotName = this.findSlot(slotIndex);
			const slotMap = (animationMap.slots[slotName] = Object.create(null));

			const timelineCount = input.readInt(true);
			for (let j = 0; j < timelineCount; j++) {
				const timelineType = input.readByte() as TimelineType;
				let timelineName = TimelineType[timelineType].toLowerCase();
				const timelineMap: any[] = [];

				const frameCount = input.readInt(true);
				const frameLast = frameCount - 1;
				switch (timelineType) {
					case TimelineType.Color:
						for (let fi = 0; fi < frameCount; fi++) {
							const keyMap = Object.create(null);
							keyMap.time = input.readFloat();
							keyMap.color = this.readRgba8888(input);
							if (fi < frameLast) {
								keyMap.curve = this.readCurve(input);
							}
							timelineMap.push(keyMap);
						}
						if (this.playerVersion > 3.7) {
							timelineName = "rgba";
						}
						break;
					case TimelineType.Attachment:
						for (let fi = 0; fi < frameCount; fi++) {
							const keyMap = Object.create(null);
							keyMap.time = input.readFloat();
							keyMap.name = input.readString();
							timelineMap.push(keyMap);
						}
						break;
					default:
						throw new Error("Not Implemented Error");
				}
				slotMap[timelineName] = timelineMap;
			}
		}

		// bone timelines
		animationMap.bones = Object.create(null);
		const bonesCount = input.readInt(true);
		for (let i = 0; i < bonesCount; i++) {
			const boneIndex = input.readInt(true);
			const boneName = this.findBone(boneIndex);
			const boneMap = (animationMap.bones[boneName] = Object.create(null));

			const timelineCount = input.readInt(true);
			for (let j = 0; j < timelineCount; j++) {
				const timelineType = input.readByte() as TimelineType;
				let timelineName = TimelineType[timelineType].toLowerCase();
				const timelineMap: any[] = [];

				const frameCount = input.readInt(true);
				const frameLast = frameCount - 1;
				switch (timelineType) {
					case TimelineType.Rotate:
						for (let fi = 0; fi < frameCount; fi++) {
							const keyMap = Object.create(null);
							keyMap.time = input.readFloat();
							keyMap.angle = input.readFloat();
							if (fi < frameLast) {
								keyMap.curve = this.readCurve(input);
							}
							timelineMap.push(keyMap);
						}
						break;
					case TimelineType.Translate:
					case TimelineType.Scale:
					case TimelineType.Shear:
						for (let fi = 0; fi < frameCount; fi++) {
							const keyMap = Object.create(null);
							keyMap.time = input.readFloat();
							keyMap.x = input.readFloat();
							keyMap.y = input.readFloat();
							if (fi < frameLast) {
								keyMap.curve = this.readCurve(input);
							}
							timelineMap.push(keyMap);
						}
						break;
					default:
						throw new Error("Not Implemented Error");
				}
				boneMap[timelineName] = timelineMap;
			}
		}

		// ik timelines
		animationMap.ik = Object.create(null);
		const ikCount = input.readInt(true);
		for (let i = 0; i < ikCount; i++) {
			const ikIndex = input.readInt(true);
			const ikConstraintName = this.findIkConstraint(ikIndex);
			const ikMap: any[] = (animationMap.ik[ikConstraintName] = []);

			const frameCount = input.readInt(true);
			const frameLast = frameCount - 1;
			for (let fi = 0; fi < frameCount; fi++) {
				const keyMap = Object.create(null);
				keyMap.time = input.readFloat();
				keyMap.mix = input.readFloat();
				keyMap.bendPositive = input.readByte() === 1;
				if (fi < frameLast) {
					keyMap.curve = this.readCurve(input);
				}
				ikMap.push(keyMap);
			}
		}

		// transform
		animationMap.transform = Object.create(null);
		const transformCount = input.readInt(true);
		for (let i = 0; i < transformCount; i++) {
			const transformIndex = input.readInt(true);
			const transformConstraintName = this.findTransformConstraint(transformIndex);
			const transformMap: any[] = (animationMap.transform[transformConstraintName] = []);

			const frameCount = input.readInt(true);
			const frameLast = frameCount - 1;
			for (let fi = 0; fi < frameCount; fi++) {
				const keyMap = Object.create(null);
				keyMap.time = input.readFloat();
				keyMap.rotateMix = input.readFloat();
				keyMap.translateMix = input.readFloat();
				keyMap.scaleMix = input.readFloat();
				keyMap.shearMix = input.readFloat();
				if (fi < frameLast) {
					keyMap.curve = this.readCurve(input);
				}
				transformMap.push(keyMap);
			}
		}

		if (this.playerVersion > 3.7) {
			// Attachment timelines.
			animationMap.attachments = Object.create(null);
			const attachmentsCount = input.readInt(true);
			for (let i = 0; i < attachmentsCount; i++) {
				const skinIndex = input.readInt(true);
				const attachmentsName = this.findSkin(skinIndex);
				const attachmentsMap = (animationMap.attachments[attachmentsName] =
					Object.create(null));

				const slotCount = input.readInt(true);
				for (let j = 0; j < slotCount; j++) {
					const slotIndex = input.readInt(true);
					const slotMapName = this.findSlot(slotIndex);
					const slotMap = (attachmentsMap[slotMapName] = Object.create(null));

					const attachmentCount = input.readInt(true);
					for (let k = 0; k < attachmentCount; k++) {
						const attachmentMapName = input.readString();
						if (!attachmentMapName)
							throw new Error("Attachment name must not be null.");
						const attachmentMap = (slotMap[attachmentMapName] = Object.create(null));

						const timelineMapName = "deform";
						const timelineMap: any[] = (attachmentMap[timelineMapName] = []);

						const frameCount = input.readInt(true);
						const frameLast = frameCount - 1;
						for (let fi = 0; fi < frameCount; fi++) {
							const keyMap = Object.create(null);
							keyMap.time = input.readFloat();
							const end = input.readInt(true);
							if (end !== 0) {
								keyMap.offset = input.readInt(true);
								keyMap.vertices = this.readFloatArray(input, end);
							}
							if (fi < frameLast) {
								keyMap.curve = this.readCurve(input);
							}
							timelineMap.push(keyMap);
						}
					}
				}
			}
		} else {
			// Deform timelines.
			// animationMap.ffd
			animationMap.deform = Object.create(null);
			const deformCount = input.readInt(true);
			for (let i = 0; i < deformCount; i++) {
				const skinIndex = input.readInt(true);
				const deformName = this.findSkin(skinIndex);
				const deformMap = (animationMap.deform[deformName] = Object.create(null));

				const slotCount = input.readInt(true);
				for (let j = 0; j < slotCount; j++) {
					const slotIndex = input.readInt(true);
					const slotName = this.findSlot(slotIndex);
					const slotMap = (deformMap[slotName] = Object.create(null));

					const timelineCount = input.readInt(true);
					for (let k = 0; k < timelineCount; k++) {
						const timelineName = input.readString();
						if (!timelineName) throw new Error("Timeline name must not be null.");
						const timelineMap: any[] = (slotMap[timelineName] = []);

						const frameCount = input.readInt(true);
						const frameLast = frameCount - 1;
						for (let fi = 0; fi < frameCount; fi++) {
							const keyMap = Object.create(null);
							keyMap.time = input.readFloat();
							const end = input.readInt(true);
							if (end !== 0) {
								keyMap.offset = input.readInt(true);
								keyMap.vertices = this.readFloatArray(input, end);
							}
							if (fi < frameLast) {
								keyMap.curve = this.readCurve(input);
							}
							timelineMap.push(keyMap);
						}
					}
				}
			}
		}

		// Draw order timelines.
		const drawOrder: any[] = [];
		const drawOrderCount = input.readInt(true);
		for (let i = 0; i < drawOrderCount; i++) {
			const drawOrderMap = Object.create(null);
			drawOrderMap.time = input.readFloat();

			const offsets: any[] = (drawOrderMap.offsets = []);
			const offsetCount = input.readInt(true);
			for (let j = 0; j < offsetCount; j++) {
				const offsetMap = Object.create(null);
				offsetMap.slot = this.findSlot(input.readInt(true));
				offsetMap.offset = input.readInt(true);
				offsets.push(offsetMap);
			}
			drawOrder.push(drawOrderMap);
		}
		if (drawOrder.length) {
			if (this.playerVersion >= 4) {
				animationMap.drawOrder = drawOrder;
			} else {
				animationMap.draworder = drawOrder;
			}
		}

		// Event timelines.
		const events: any[] = [];
		const eventsCount = input.readInt(true);
		for (let i = 0; i < eventsCount; i++) {
			const eventMap = Object.create(null);
			eventMap.time = input.readFloat();
			const event = this.findEvent(input.readInt(true));
			eventMap.name = event.name;
			eventMap.int = input.readInt(false);
			eventMap.float = input.readFloat();
			if (input.readBoolean()) {
				eventMap.string = input.readString();
			} else {
				eventMap.string = event.string;
			}
			events.push(eventMap);
		}
		if (events.length) {
			animationMap.events = events;
		}

		return animationMap;
	}

	private readCurve(input: BinaryInput) {
		const curveType = input.readByte() as CurveType;
		switch (curveType) {
			case CurveType.Stepped:
				return "stepped";
			case CurveType.Bezier:
				return this.readFloatArray(input, 4);
		}
		return null;
	}

	private readVertices(input: BinaryInput, vertexCount: number) {
		const verticesLength = vertexCount << 1;
		return this.readFloatArray(input, verticesLength);
	}

	private readFloatArray(input: BinaryInput, n: number): number[] {
		const array = new Array<number>(n);
		for (let i = 0; i < n; i++) array[i] = input.readFloat();
		return array;
	}

	private readShortArray(input: BinaryInput): number[] {
		const n = input.readInt(true);
		const array = new Array<number>(n);
		for (let i = 0; i < n; i++) array[i] = input.readShort();
		return array;
	}

	private readRgba8888(input: BinaryInput): string {
		const color = Object.create(null);
		Color.rgba8888ToColor(color, input.readInt32());
		return fromRatio(color).toHex8String();
	}
}

enum AttachmentType {
	Region,
	BoundingBox,
	Mesh,
	WeightedMesh,
	LinkedMesh,
	WeightedLinkedMesh,
	// Path,
	// Point,
	// Clipping,
}

enum TimelineType {
	Rotate,
	Translate,
	Scale,
	Shear,
	Attachment,
	Color,
}

enum CurveType {
	Linear,
	Stepped,
	Bezier,
}
