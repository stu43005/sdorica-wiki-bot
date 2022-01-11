import { localizationString } from '../../localization';
import { LevelEventAsset } from '../../sdorica/LevelEventAsset';
import { InterpretedEncounterEventObject, InterpretedSceneSwitchEventPointObject } from '../leveldata-tarns-event';
import { ViewerJSHelper } from '../viewerjs-helper';
import { containerSearchAuto, getLevelEventPath, ImperiumData, treasureList } from './$ViewerInit';

export default async function (helper: ViewerJSHelper) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	const levelset = new Set<string>();

	async function findSceneSwitch(level: string, dropItemGroupId?: string): Promise<Record<string, any>> {
		const out: Record<string, any> = {
			level: `${level} (${localizationString("QuestName")(level)})`,
		};
		if (dropItemGroupId && Number(dropItemGroupId) > 1) {
			out["dropItemGroupId"] = dropItemGroupId;
			out["dropItem"] = treasureList(Number(dropItemGroupId));
		}
		if (levelset.has(level)) {
			out["duplicate"] = "已重複關卡，請用 Ctrl+F 搜尋此關卡。";
			return out;
		}
		levelset.add(level);

		const leveleventData = await containerSearchAuto(helper, getLevelEventPath(level)) as LevelEventAsset;
		if (leveleventData.$interpreted) {
			await Promise.all(leveleventData.$interpreted.map(async (event, index) => {
				if (event.類型 == "遭遇事件") {
					const encounter = event as InterpretedEncounterEventObject;
					await Promise.all(encounter.optionSet.map(async (optionSet) => {
						const title = optionSet.標題;
						await Promise.all(optionSet.選項.map(async (option, index2) => {
							const content = option.選項;
							const sceneSwitch = option.效果.find((effect) => effect.indexOf("sceneSwitch") != -1);
							if (sceneSwitch) {
								const match = sceneSwitch.match(/sceneSwitch\(\[SceneName\](\w+);\[LevelName\](\w+);\[DropItemGroupId\](\w+)\)/i);
								if (match) {
									const nextLevelName = match[2];
									const nextDropItemGroupId = match[3];
									out[`${index}-${index2}-遭遇事件([title]${title};[option]${content})`] = "waiting data...";
									out[`${index}-${index2}-遭遇事件([title]${title};[option]${content})`] = await findSceneSwitch(nextLevelName, nextDropItemGroupId);
								}
							}
						}));
					}));
				}
				else if (event.類型 == "關卡切換") {
					const sceneSwitch = event as InterpretedSceneSwitchEventPointObject;
					out[`${index}-關卡切換`] = "waiting data...";
					out[`${index}-關卡切換`] = await findSceneSwitch(sceneSwitch.LevelName, sceneSwitch.DropItemGroupId || undefined);
				}
			}));
		}
		else {
			out["error"] = "沒有$interpreted?";
		}
		return out;
	}

	try {
		const questNameKey = prompt("Enter quest name key");
		if (questNameKey == null) {
			throw "No input.";
			// questNameKey = "fest_summer_start";
		}
		return await findSceneSwitch(questNameKey);
	} catch (error) {
		return {
			error: error
		};
	}
}
