declare module 'number-to-chinese-words' {
	function toOrdinal(num: number): string;
	function toWords(num: number): string;
	function toWordsOrdinal(num: number): string;

	const labels: {
		digits: [string, string, string, string, string, string, string, string, string, string],
		units: [string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string, string],
		ordinal: string,
		point: string,
		minus: string,
	};
}
