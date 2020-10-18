import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { Hero } from "../model/hero";
import { questMetadata, questSideStoryLimit } from "../wiki-quest";

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");

export default function wikiSideStory() {
	const out: string[] = [];
	const SideStoryChapters = ChaptersTable.filter(ch => ch.get("category") == "SideStory");
	for (let i = 0; i < SideStoryChapters.length; i++) {
		const row = SideStoryChapters[i];
		const chID = row.get("id");
		const title = localizationString("RegionName")(row.get("title"));
		const hero = Hero.find(hero => hero.storyChapter == chID);
		if (hero) {
			let chname = `${hero.firstname}《${title}》`;
			if (hero.firstname == "愛麗絲") {
				chname = `Sdorica X DEEMO《${title}》`;
			}

			let str = `==[[${chname}]]==`;
			const quests = QuestsTable.filter(q => q.get("chapter") == chID && q.get("enable"));
			for (let j = 0; j < quests.length; j++) {
				const quest = quests[j];
				const { name: qname } = questMetadata(quest, row);
				str += `\n===[[${chname}/${qname}]]===`;
				const sideStoryLimit = questSideStoryLimit(quest, row);
				if (sideStoryLimit[1]) {
					str += `\n${sideStoryLimit[1]}`;
				}
			}
			out.push(str);
		}
	}
	return out.join("\n\n");
}
