import { h } from "preact";

type TooltipPosition = "top" | "right" | "left" | "bottom";

/**
 * 取得`{{tooltip}}`模板
 */
export function tooltipTemplate(
	text: string,
	tooltip: string,
	position: TooltipPosition = "top",
): h.JSX.Element {
	return (
		<i class={`qtip tip-${position}`} data-tip={tooltip}>
			{text}
		</i>
	);
}
