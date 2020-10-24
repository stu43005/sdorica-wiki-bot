export type Dictionary<T1, T2> = DictionaryEntry<T1, T2>[];

export interface DictionaryEntry<T1, T2> {
	Key: T1;
	Value: T2;
}
