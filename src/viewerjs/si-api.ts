import { SiContainerMultiSearch, SiContainerSearch } from "./types/container-search.js";
import { SiContainer, SiContainers } from "./types/containers.js";
import { SiImperium } from "./types/imperium.js";
import { type ViewerJSHelper } from "./viewerjs-helper.js";

export class SdoricaInspectorApi {
	constructor(private helper: ViewerJSHelper) {}

	async imperium() {
		const response = await this.helper.vue.$http.get<SiImperium[]>("/api/imperium/");
		return response.data;
	}

	async containerSearch(query: string) {
		const response = await this.helper.vue.$http.get<SiContainerSearch>(
			"/api/container/search/",
			{
				params: {
					query,
				},
			},
		);
		return response.data;
	}

	async containerMultiSearch(queries: string[]) {
		const response = await this.helper.vue.$http.post<SiContainerMultiSearch>(
			`/api/container/multi_search/`,
			{
				queries,
			},
			{
				timeout: 0,
			},
		);
		return response.data;
	}

	async assetbundleContainers(md5: string) {
		const response = await this.helper.vue.$http.get<SiContainers>(
			`/api/asset_bundle/${md5}/containers/`,
		);
		return response.data;
	}

	async assetbundleContainer(md5: string, pathId: string) {
		const response = await this.helper.vue.$http.get<SiContainer>(
			`/api/asset_bundle/${md5}/containers/${pathId}/`,
		);
		return response.data;
	}

	async assetbundleContainerData(md5: string, pathId: string) {
		const response = await this.helper.vue.$http.get<NodeJS.ReadableStream>(
			`/api/asset_bundle/${md5}/containers/${pathId}/data/`,
			{
				responseType: "stream",
			},
		);
		return response.data;
	}

	async assetbundleContainerMultiRetrieve(queries: [md5: string, pathId: string][]) {
		const response = await this.helper.vue.$http.post<SiContainer[]>(
			`/api/asset_bundle/containers/multi_retrieve/`,
			{
				queries: queries,
			},
			{
				timeout: 0,
			},
		);
		return response.data;
	}
}
