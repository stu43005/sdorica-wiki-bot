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
	get max(): number { return +this.row.get('max'); }

	get regainType(): ChapteCountType { return this.row.get('regainType'); }
	get regainValue(): number { return +this.row.get('regainValue'); }

	get itemIcon(): boolean { return !!this.row.get('itemIcon'); }
	payItem: ItemPayRef;

	constructor(private row: RowWrapper) {
		this.name = new TemplateString(localizationString('ChapterCount')(row.get('name')));
		this.payItem = new ItemPayRef(row.get('payType'), row.get('linkId'), row.get('amount'));
	}
}
