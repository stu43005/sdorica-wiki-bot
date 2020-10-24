import { SiDiffData } from '../types/diff-data';
import { SiImperium } from '../types/imperium';
import { ViewerJSHelper } from '../viewerjs-helper';

export default async function (helper: ViewerJSHelper) {
	const vue = helper.vue;
	const { data: imperiums }: { data: SiImperium[] } = await vue.$http.get('/api/imperium/', {
		params: {
			finished: 'true'
		}
	});
	let versionText = "";

	async function omg(typename: string) {
		const modelRegexp = /(b|e|h|t|m|r|n)\d{4}/ig;
		const data = {
			ab_add: <string[]>[],
			ab_change: <string[]>[],
			ab_delete: <string[]>[],
			add: <string[]>[],
			change: <string[]>[],
			delete: <string[]>[],
			"add&delete": <string[]>[],
		};

		const typeId = vue.$imperiumType.indexOf(typename);
		if (typeId < 0) return data;
		const filteredImperiums = imperiums.filter(x => x.type_id === typeId && x.name.indexOf("longyuan") == -1);
		if (filteredImperiums.length < 2) return data;
		const new_id = filteredImperiums[0].id;
		const old_id = filteredImperiums[1].id;
		versionText += `\n${typename}\n- old:${old_id}::${filteredImperiums[1].name}\n- new:${new_id}::${filteredImperiums[0].name}`;
		const { data: diffData }: { data: SiDiffData } = await vue.$http.get('/api/imperium/ab_diff/', {
			params: {
				old: old_id,
				new: new_id
			}
		});

		for (const abkey in diffData.add) {
			if (abkey.match(modelRegexp)) {
				data.ab_add.push(`${abkey} (${diffData.add[abkey].md5})`);
			}
			const diff = diffData.add[abkey];
			diff.data.forEach(path => {
				if (path.match(modelRegexp)) {
					data.add.push(path);
				}
			});
		}

		for (const abkey in diffData.delete) {
			if (abkey.match(modelRegexp)) {
				data.ab_delete.push(`${abkey} (${diffData.delete[abkey].md5})`);
			}
			const diff = diffData.delete[abkey];
			diff.data.forEach(path => {
				if (path.match(modelRegexp)) {
					data.delete.push(path);
				}
			});
		}

		for (const abkey in diffData.change) {
			if (abkey.match(modelRegexp)) {
				data.ab_change.push(`${abkey} (${diffData.change[abkey].md5.join(" -> ")})`);
			}
			const diff = diffData.change[abkey];
			diff.add.forEach(path => {
				if (path.match(modelRegexp)) {
					if (diff.delete.find(p2 => p2 == path)) {
						data.change.push(path);
					}
					else {
						data.add.push(path);
					}
				}
			});
			diff.delete.forEach(path => {
				if (path.match(modelRegexp)) {
					if (diff.add.find(p2 => p2 == path)) {
						// nothing
					}
					else {
						data.delete.push(path);
					}
				}
			});
		}

		for (let i = 0; i < data.add.length; i++) {
			const path = data.add[i];
			const findIndex = data.delete.findIndex(p => p === path);
			if (findIndex != -1) {
				data.add.splice(i, 1);
				i--;
				data.delete.splice(findIndex, 1);
				data["add&delete"].push(path);
			}
		}
		return data;
	}

	function filter(s: string) {
		return !s.match(/\.prefab$/);
	}

	const data1 = await omg("android");
	const data2 = await omg("androidExp");
	const data = {
		"!! Imperium version !!": versionText,
		ab_add: data1.ab_add.concat(data2.ab_add).filter(filter).sort().map(p => `ab add: ${p}`),
		ab_change: data1.ab_change.concat(data2.ab_change).filter(filter).sort().map(p => `ab change: ${p}`),
		ab_delete: data1.ab_delete.concat(data2.ab_delete).filter(filter).sort().map(p => `ab delete: ${p}`),
		add: data1.add.concat(data2.add).filter(filter).sort().map(p => `add: ${p}`),
		change: data1.change.concat(data2.change).filter(filter).sort().map(p => `change: ${p}`),
		delete: data1.delete.concat(data2.delete).filter(filter).sort().map(p => `delete: ${p}`),
		"add&delete": data1["add&delete"].concat(data2["add&delete"]).filter(filter).sort().map(p => `add & delete: ${p}`),
	};

	return data;
}
