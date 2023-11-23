import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { Chapter } from "./chapter";
import { StateCondition, stateConditionText } from "./enums/state-condition.enum";
import { VolumeEnum } from "./enums/volume.enum";

const VolumeTable = ImperiumData.fromGamedata().getTable("Volume");

const instances: Record<string, Volume> = {};
let allInstances: Volume[] | null = null;

export class Volume {
	public static get(row: RowWrapper): Volume;
	public static get(volume: VolumeEnum): Volume | undefined;
	public static get(rowOrVolume: RowWrapper | VolumeEnum): Volume {
		const volume = typeof rowOrVolume === "string" ? rowOrVolume : rowOrVolume.get("volume");
		if (!instances[volume]) {
			const row =
				typeof rowOrVolume === "string"
					? VolumeTable.find((r) => r.get("volume") == volume)
					: rowOrVolume;
			if (row) {
				instances[volume] = new Volume(row);
			}
		}
		return instances[volume];
	}

	public static find(predicate: (value: Volume) => boolean): Volume | undefined {
		for (const item of this.getAllGenerator()) {
			if (predicate(item)) {
				return item;
			}
		}
	}

	public static getAll() {
		return (allInstances ??= Array.from(this.getAllGenerator()));
	}

	public static *getAllGenerator() {
		for (let i = 0; i < VolumeTable.length; i++) {
			const row = VolumeTable.get(i);
			yield Volume.get(row);
		}
	}

	/**
	 * @alias {@link Volume.order}
	 */
	get id(): number {
		return this.order;
	}

	get volume(): VolumeEnum {
		return this.row.get("volume");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}
	get order(): number {
		return +this.row.get("order");
	}

	/**
	 * 首頁menu bar的名稱
	 */
	name: string;
	get title(): string {
		return this.row.get("title");
	}

	get visibleCondition(): StateCondition {
		return this.row.get("visibleCondition");
	}
	get visibleConditionParam(): string {
		return this.row.get("param1");
	}
	visibleConditionText: string;
	get unlockCondition(): StateCondition {
		return this.row.get("unlockCondition");
	}
	get unlockConditionParam(): string {
		return this.row.get("param2");
	}
	unlockConditionText: string;
	unlockText: string;
	unlockNoteText: string;

	#chapters: Chapter[] | null = null;
	get chapters(): Chapter[] {
		return (this.#chapters ??= Chapter.getByVolume(this));
	}

	constructor(private row: RowWrapper) {
		this.name = localizationString("Metagame")(row.get("name")) || row.get("name");
		this.unlockText = localizationString("LockMessage")(row.get("unlockText"));
		this.unlockNoteText = localizationString("LockMessage")(row.get("unlockNoteText"));

		this.visibleConditionText = stateConditionText(
			this.visibleCondition,
			this.visibleConditionParam
		);
		this.unlockConditionText = stateConditionText(
			this.unlockCondition,
			this.unlockConditionParam
		);
	}
}
