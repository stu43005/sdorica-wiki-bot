import { fsSerializer } from "../../lib/FullSerializer/fsSerializer";
import { Logger } from "../../logger";
import { siJsonParse } from "../utils";
import { ViewerJSHelper } from "../viewerjs-helper";

const logger = new Logger("$DataInit");

export default function (helper: ViewerJSHelper, data: Record<string, any>) {
	logger.log("call $DataInit", helper, data);

	const out: Record<string, any> = {};
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			const value = data[key];
			switch (key) {
				case "_serializedStateKeys": {
					const _serializedStateKeys = value;
					const _serializedStateValues = data["_serializedStateValues"];
					for (let i = 0; i < _serializedStateKeys.length; i++) {
						const key2 = _serializedStateKeys[i];
						let value2 = _serializedStateValues[i];
						try {
							value2 = siJsonParse(value2);
						} catch (error) {}
						out[key2] = value2;
					}
					break;
				}
				case "m_GameObject":
				case "m_Enabled":
				case "_serializedStateValues":
				case "_objectReferences":
					break;
				default:
					out[key] = value;
					break;
			}
		}
	}

	const serializer = new fsSerializer();
	const deserialized = serializer.TryDeserialize(out);

	logger.log("new data: ", deserialized);
	return deserialized;
}
