export type Dictionary<TValue> = { [key: string]: TValue };

// https://github.com/jacobdufault/fullserializer/blob/master/Assets/FullSerializer/Source/fsData.cs

/**The actual type that a JsonData instance can store. */
export enum fsDataType {
	Array,
	Object,
	Double,
	// Int64,
	Boolean,
	String,
	Null,
}

/**
 * A union type that stores a serialized value. The stored type can be one
 * of six different
 * types: null, boolean, double, Int64, string, Dictionary, or List.
 */
export class fsData {
	/**
	 * The raw value that this serialized data stores. It can be one of six
	 * different types; a boolean, a double, Int64, a string, a Dictionary,
	 * or a List.
	 */
	_value: any;

	/**Creates a fsData instance that holds null. */
	constructor();

	/**Creates a fsData instance that holds a boolean. */
	constructor(boolean: boolean);

	/**Creates a fsData instance that holds a double. */
	constructor(f: number);

	/**Creates a new fsData instance that holds an integer. */
	constructor(i: number);

	/**Creates a fsData instance that holds a string. */
	constructor(str: string);

	/**Creates a fsData instance that holds a dictionary of values. */
	constructor(dict: Dictionary<any>);

	/**Creates a fsData instance that holds a list of values. */
	constructor(list: any[]);

	constructor(value?: any) {
		this._value = value;
	}

	/**Helper method to create a fsData instance that holds a dictionary. */
	static CreateDictionary(): fsData {
		return new fsData(<Dictionary<any>>{});
	}

	/**Helper method to create a fsData instance that holds a list. */
	static CreateList(): fsData;

	/**
	 * Helper method to create a fsData instance that holds a list with the
	 * initial capacity.
	 */
	static CreateList(capacity?: number): fsData {
		return new fsData(<any[]>[]);
	}

	public static readonly True: fsData = new fsData(true);
	public static readonly False: fsData = new fsData(false);
	public static readonly Null: fsData = new fsData();

	/**Transforms the internal fsData instance into a dictionary. */
	BecomeDictionary(): void {
		this._value = <Dictionary<fsData>>{};
	}

	/**Returns a shallow clone of this data instance. */
	Clone(): fsData {
		const clone = new fsData();
		clone._value = this._value;
		return clone;
	}

	get Type(): fsDataType {
		if (this._value == null) return fsDataType.Null;
		if (typeof this._value == "number") return fsDataType.Double;
		if (typeof this._value == "boolean") return fsDataType.Boolean;
		if (typeof this._value == "string") return fsDataType.String;
		if (typeof this._value == "object") {
			if (this._value instanceof Array) return fsDataType.Array;
			return fsDataType.Object;
		}

		throw new Error("InvalidOperationException: unknown JSON data type");
	}

	/**Returns true if this fsData instance maps back to null. */
	get IsNull() {
		return this._value == null;
	}

	/**Returns true if this fsData instance maps back to a double. */
	get IsDouble() {
		return typeof this._value == "number";
	}

	/**Returns true if this fsData instance maps back to an Int64. */
	get IsInt64() {
		return typeof this._value == "number";
	}

	/**Returns true if this fsData instance maps back to a boolean. */
	get IsBool() {
		return typeof this._value == "boolean";
	}

	/**Returns true if this fsData instance maps back to a string. */
	get IsString() {
		return typeof this._value == "string";
	}

	/**Returns true if this fsData instance maps back to a Dictionary. */
	get IsDictionary() {
		return typeof this._value == "object" && !(this._value instanceof Array);
	}

	/**Returns true if this fsData instance maps back to a List. */
	get IsList() {
		return typeof this._value == "object" && this._value instanceof Array;
	}

	/**
	 * Casts this fsData to a double. Throws an exception if it is not a
	 * double.
	 */
	get AsDouble(): number {
		return Number(this._value);
	}

	/**
	 * Casts this fsData to an Int64. Throws an exception if it is not an
	 * Int64.
	 */
	get AsInt64() {
		return Number(this._value);
	}

	/**
	 * Casts this fsData to a boolean. Throws an exception if it is not a
	 * boolean.
	 */
	get AsBool() {
		return Boolean(this._value);
	}

	/**
	 * Casts this fsData to a string. Throws an exception if it is not a
	 * string.
	 */
	get AsString() {
		return String(this._value);
	}

	/**
	 * Casts this fsData to a Dictionary. Throws an exception if it is not a
	 * Dictionary.
	 */
	get AsDictionary() {
		return this._value as Dictionary<any>;
	}

	/**Casts this fsData to a List. Throws an exception if it is not a List. */
	get AsList() {
		return this._value as any[];
	}

	get toString() {
		return JSON.stringify(this._value);
	}

	/**
	 * Determines whether the specified object is equal to the current
	 * object.
	 */
	Equals(other: fsData): boolean {
		if (other == null || this.Type != other.Type) {
			return false;
		}

		switch (this.Type) {
			case fsDataType.Null:
				return true;

			case fsDataType.Double:
				return (
					this.AsDouble == other.AsDouble ||
					Math.abs(this.AsDouble - other.AsDouble) < 4.94065645841247e-324
				);

			// case fsDataType.Int64: AsInt64: return;

			case fsDataType.Boolean:
				return this.AsBool == other.AsBool;

			case fsDataType.String:
				return this.AsString == other.AsString;

			case fsDataType.Array: {
				const thisList = this.AsList;
				const otherList = other.AsList;

				if (thisList.length != otherList.length) return false;

				for (let i = 0; i < thisList.length; ++i) {
					if (thisList[i].Equals(otherList[i]) == false) {
						return false;
					}
				}

				return true;
			}
			case fsDataType.Object:
				var thisDict = this.AsDictionary;
				var otherDict = other.AsDictionary;

				if (thisDict.Count != otherDict.Count) return false;

				for (const key in thisDict.Keys) {
					if (!(key in otherDict)) {
						return false;
					}

					if (thisDict[key].Equals(otherDict[key]) == false) {
						return false;
					}
				}

				return true;
		}

		throw new Error("Unknown data type");
	}
}
