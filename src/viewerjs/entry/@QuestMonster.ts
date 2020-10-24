import { localizationCharacterName, localizationString } from '../../localization';
import { BattleCharacterAsset } from '../../sdorica/BattleCharacterAsset';
import { EnemySetAsset } from '../../sdorica/EnemySetAsset';
import { LevelActorAsset } from '../../sdorica/LevelActorAsset';
import { WaveSetAsset } from '../../sdorica/WaveSetAsset';
import { ViewerJSHelper } from '../viewerjs-helper';
import { containerSearch, containerSearchMultiSplit, ImperiumData } from './$ViewerInit';

export default async function (helper: ViewerJSHelper) {
	// load imperium data
	await ImperiumData.fromGamedata().loadData();
	await ImperiumData.fromLocalization().loadData();

	try {
		const questNameKey = prompt("Enter quest name key");
		if (questNameKey == null) {
			throw "No input.";
		}
		const isLoadEnemyData = confirm("Load all enemy data?");
		const startTime = Date.now();

		const wavesetPath = `assets/game/leveldata/wavesetdata/${questNameKey}_waveset.asset`;
		const wavesetData = await containerSearch(helper, wavesetPath) as WaveSetAsset;
		const wavesets = Object.values(wavesetData.Model.waves).map(wave => wave.weightedEnemySet);

		const levelactorPath = `assets/game/leveldata/levelactordata/${questNameKey}_levelactor.asset`;
		let levelactorData: LevelActorAsset;
		try {
			levelactorData = await containerSearch(helper, levelactorPath) as LevelActorAsset;
		} catch (error) {
			debugger;
		}

		const enemysetKeys = wavesets.reduce((prev, curr) => prev.concat(curr.map(c => c.Key.name)), [] as string[]);
		const enemysetPath = enemysetKeys.map(enemySetKey => `assets/game/leveldata/enemysetdata/${enemySetKey}.asset`);
		const enemysetDatas = await containerSearchMultiSplit(helper, enemysetPath) as EnemySetAsset[];

		let allEnemiesData: BattleCharacterAsset[] = [];
		if (isLoadEnemyData) {
			const allEnemies = enemysetDatas.map(enemySetData => {
				return enemySetData.enemyList.map(e => {
					let name = e.character.name;
					if (e.character.type == 1 && levelactorData && levelactorData.ActorCharacterTable && e.character.name in levelactorData.ActorCharacterTable) {
						name = levelactorData.ActorCharacterTable[e.character.name].Name;
					}
					return name;
				});
			}).reduce((prev, arr) => prev.concat(arr), []);
			const allEnemiesPath = allEnemies.map(enemy => `assets/game/character/battlecharacter/charactermodel/${enemy}.asset`);
			allEnemiesData = await containerSearchMultiSplit(helper, allEnemiesPath) as BattleCharacterAsset[];
		}

		const out: Record<string, any> = {
			quest: `${questNameKey} (${localizationString("QuestName")(questNameKey)})`,
		};
		for (let i = 0; i < wavesets.length; i++) {
			const enemySets = wavesets[i];
			const waveOut: Record<string, string[]> = {};
			for (let j = 0; j < enemySets.length; j++) {
				const enemySet = enemySets[j];
				const enemySetKey = enemySet.Key.name;
				const outKey = `${enemySetKey} (level: ${enemySet.Value.level}, weight: ${enemySet.Value.weight})`;
				const keyIndex = enemysetKeys.indexOf(enemySetKey);
				const enemySetData = enemysetDatas[keyIndex];
				const enemies = enemySetData.enemyList.map(e => {
					let name = e.character.name;
					if (e.character.type == 1 && levelactorData && levelactorData.ActorCharacterTable && e.character.name in levelactorData.ActorCharacterTable) {
						name = levelactorData.ActorCharacterTable[e.character.name].Name;
					}
					const charAsset = allEnemiesData.find(asset => asset.m_Name == name);
					return `${name} (${localizationCharacterName()(name) ? localizationCharacterName()(name) : localizationCharacterName()(name.split("_")[0])}) (level: ${e._level}, initHpRatio: ${e._initHpRatio}, initArmorRatio: ${e._initArmorRatio}, initialCdBase: ${e._initialCdBase}${charAsset && charAsset.$interpreted ? `, 血量: ${charAsset.$interpreted.血量}, 疊盾: ${charAsset.$interpreted.疊盾}, 攻擊力: ${charAsset.$interpreted.攻擊力}` : ""})`;
				});
				waveOut[outKey] = enemies;
			}
			out[`wave ${i + 1}`] = waveOut;
		}

		const endTime = Date.now();
		out["耗時"] = `${Math.floor((endTime - startTime) / 1000)}秒`;
		return out;
	} catch (error) {
		return {
			error: error,
		};
	}
}
