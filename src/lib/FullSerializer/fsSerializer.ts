import { Dictionary, fsData } from "./fsData.js";

const fsGlobalConfig = {
	InternalFieldPrefix: "$",
};

// https://github.com/jacobdufault/fullserializer/blob/master/Assets/FullSerializer/Source/fsSerializer.cs
export class fsSerializer {
	private static readonly Key_ObjectReference = `${fsGlobalConfig.InternalFieldPrefix}ref`;
	private static readonly Key_ObjectDefinition = `${fsGlobalConfig.InternalFieldPrefix}id`;
	private static readonly Key_InstanceType = `${fsGlobalConfig.InternalFieldPrefix}type`;
	private static readonly Key_Version = `${fsGlobalConfig.InternalFieldPrefix}version`;
	private static readonly Key_Content = `${fsGlobalConfig.InternalFieldPrefix}content`;

	private static IsObjectReference(data: fsData): boolean {
		if (data.IsDictionary == false) return false;
		return fsSerializer.Key_ObjectReference in data.AsDictionary;
	}
	private static IsObjectDefinition(data: fsData): boolean {
		if (data.IsDictionary == false) return false;
		return fsSerializer.Key_ObjectDefinition in data.AsDictionary;
	}
	private static IsVersioned(data: fsData): boolean {
		if (data.IsDictionary == false) return false;
		return fsSerializer.Key_Version in data.AsDictionary;
	}
	private static IsTypeSpecified(data: fsData): boolean {
		if (data.IsDictionary == false) return false;
		return fsSerializer.Key_InstanceType in data.AsDictionary;
	}
	private static IsWrappedData(data: fsData): boolean {
		if (data.IsDictionary == false) return false;
		return fsSerializer.Key_Content in data.AsDictionary;
	}

	// TODO: https://github.com/jacobdufault/fullserializer/blob/master/Assets/FullSerializer/Source/Internal/fsCyclicReferenceManager.cs
	private readonly _references: Dictionary<any> = {};

	public TryDeserialize(data: any | fsData): any {
		if (!(data instanceof fsData)) {
			return this.TryDeserialize(new fsData(data));
		}
		if (data.IsNull) {
			return null;
		}

		return this.InternalDeserialize_1_CycleReference(data);
	}

	InternalDeserialize_1_CycleReference(data: fsData) {
		if (fsSerializer.IsObjectReference(data)) {
			const refId = data.AsDictionary[fsSerializer.Key_ObjectReference];
			return this._references[refId];
		}

		return this.InternalDeserialize_2_Version(data);
	}

	InternalDeserialize_2_Version(data: fsData) {
		if (fsSerializer.IsVersioned(data)) {
			debugger;
			throw new Error("Versioned not supported.");
		}

		return this.InternalDeserialize_3_Inheritance(data);
	}

	InternalDeserialize_3_Inheritance(data: fsData) {
		// let objectType = storageType;

		if (fsSerializer.IsTypeSpecified(data)) {
			// debugger;
			// throw new Error("TypeSpecified not supported.");
			// const typeNameData = new fsData(data.AsDictionary[fsSerializer.Key_InstanceType]);
			// do {
			// 	if (typeNameData.IsString == false) {
			// 		console.log(fsSerializer.Key_InstanceType + " value must be a string (in " + data + ")");
			// 		break;
			// 	}
			// 	const typeName = typeNameData.AsString;
			// 	const type = fsTypeCache.GetType(typeName);
			// 	if (type == null) {
			// 		console.error("Unable to locate specified type \"" + typeName + "\"");
			// 		debugger;
			// 		break;
			// 	}
			// 	objectType = type;
			// } while (false);
		}

		return this.InternalDeserialize_4_Cycles(data, data._value);
	}

	InternalDeserialize_4_Cycles(data: fsData, result: any) {
		if (fsSerializer.IsObjectDefinition(data)) {
			const sourceId = data.AsDictionary[fsSerializer.Key_ObjectDefinition];
			this._references[sourceId] = result;
		}

		return this.InternalDeserialize_5_Converter(data, result);
	}

	InternalDeserialize_5_Converter(data: fsData, result: any) {
		if (fsSerializer.IsWrappedData(data)) {
			data = new fsData(data.AsDictionary[fsSerializer.Key_Content]);
			result = data._value;
		}
		if (data.IsDictionary) {
			result = data.AsDictionary;
			for (const key in result) {
				if (result.hasOwnProperty(key)) {
					const value = result[key];
					result[key] = this.TryDeserialize(new fsData(value));
				}
			}
		} else if (data.IsList) {
			result = data.AsList;
			for (let index = 0; index < result.length; index++) {
				const value = result[index];
				result[index] = this.TryDeserialize(new fsData(value));
			}
		}
		// return GetConverter(resultType, overrideConverterType).TryDeserialize(data, ref result, resultType);
		return result;
	}
}
