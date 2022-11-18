import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationString } from "../localization";
import { ChapteCountType } from "./enums/chapter-count-type.enum";
import { ItemPayRef } from "./item-pay-ref";
import { TemplateString } from "./template-string";

const ChapterCountTable = ImperiumData.fromGamedata().getTable("ChapterCount");

const instances: Record<string, ChapterCount> = {};

export class ChapterCount {
	public static get(row: RowWrapper): ChapterCount;
	public static get(id: string): ChapterCount | undefined;
	public static get(rowOrId: RowWrapper | string): ChapterCount {
		const id = typeof rowOrId === 'string' ? rowOrId : rowOrId.get('id');
		if (!instances[id]) {
			const row = typeof rowOrId === 'string' ? ChapterCountTable.find(r => r.get('id') == id) : rowOrId;
			if (row) {
				instances[id] = new ChapterCount(row);
			}
		}
		return instances[id];
	}

	get id(): string { return this.row.get('id'); }
	name: TemplateString;

	get dynamicRate(): boolean { return !!this.row.get('dynamicRate'); }

	get initial(): number { return +this.row.get('initial'); }
	/**
	 * 累積最大關卡次數
	 */
	get max(): number { return +this.row.get('max'); }

	get regainType(): ChapteCountType { return this.row.get('regainType'); }
	get regainValue(): number { return +this.row.get('regainValue'); }
	/**
	 * 自動恢復關卡次數
	 */
	regainString: string;

	get itemIcon(): boolean { return !!this.row.get('itemIcon'); }
	/**
	 * 增加可完成次數消耗1
	 */
	payItem: ItemPayRef;
	/**
	 * 增加可完成次數消耗2
	 */
	payItem2: ItemPayRef;

	constructor(private row: RowWrapper) {
		this.name = new TemplateString(localizationString('ChapterCount')(row.get('name')));
		this.payItem = new ItemPayRef(row.get('payType'), row.get('linkId'), row.get('amount'));
		this.payItem2 = new ItemPayRef(row.get('payType2'), row.get('linkId2'), row.get('amount2'));

		let regainStringKey = '';
		switch (this.regainType) {
			case ChapteCountType.Daily:
				regainStringKey = 'chapter_revive_time';
				break;
			case ChapteCountType.Weekly:
				regainStringKey = 'chapter_revive_time_week';
				break;
		}
		this.regainString = new TemplateString(localizationString('Metagame')(regainStringKey)).apply({
			revive: this.regainValue,
		});
	}
}
