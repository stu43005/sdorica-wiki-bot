import { h } from "preact";
import render from "preact-render-to-string";

export function wrapRender<F extends (...args: any[]) => h.JSX.Element>(
	func: F
): (...args: Parameters<F>) => string {
	return (...args: Parameters<F>): string => {
		return render(func(...args));
	};
}
