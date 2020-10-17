import { wikitemplate } from "../wiki-utils";

/**
 * 取得`{{tooltip}}`模板
 */
export function tooltipTemplate(text: string, tooltip: string) {
	return wikitemplate('tooltip', {
		1: text,
		2: tooltip,
	});
}
