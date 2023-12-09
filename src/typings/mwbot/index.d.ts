declare module "mwbot" {
	import request from "request";

	namespace MWBot {
		interface MWOptions {
			verbose?: boolean;
			silent?: boolean;
			defaultSummary?: string;
			concurrency?: number;
			apiUrl?: string;
			sparqlEndpoint?: string;
			username?: string;
			password?: string;
		}

		type RequestOptions = request.CoreOptions & request.OptionalUriUrl;

		interface MWState {}

		interface BatchJobs {
			create: { [title: string]: string };
			update: { [title: string]: string };
			delete: string[];
			edit: { [title: string]: string };
			upload: { [title: string]: string };
		}

		type BatchJobList = string[][];

		type MWRevision = {
			contentmodel: string;
			contentformat: string;
			"*": string;
		};

		type MWRevisionSlot = {
			slots: {
				main: MWRevision;
			};
		};

		interface MWQueryResponse {
			batchcomplete: string;
			query: {
				pages: {
					[pageid: string]: {
						ns: number;
						pageid: number;
						title: string;
						missing?: string;
						revisions?: MWRevision[] | MWRevisionSlot[];
					};
				};
			};
		}

		interface MWEditResponse {
			edit: {
				result: string;
				pageid: number;
				title: string;
				contentmodel: string;
				oldrevid: number;
				newrevid: number;
				newtimestamp: string;
			};
		}
	}

	class MWBot {
		constructor(customOptions?: MWBot.MWOptions, customRequestOptions?: MWBot.RequestOptions);

		// GETTER & SETTER
		version: string;
		setOptions(customOptions: MWBot.MWOptions): void;
		setGlobalRequestOptions(customRequestOptions: MWBot.RequestOptions): void;
		setApiUrl(apiUrl: string): void;

		// CORE REQUESTS
		rawRequest(requestOptions: MWBot.RequestOptions): Promise<any>;
		request(params: object, customRequestOptions?: MWBot.RequestOptions): Promise<any>;

		// CORE FUNCTIONS
		login(loginOptions?: MWBot.MWOptions): Promise<MWBot.MWState>;
		getEditToken(): Promise<MWBot.MWState>;
		getCreateaccountToken(): Promise<MWBot.MWState>;
		loginGetEditToken(loginOptions?: MWBot.MWOptions): Promise<MWBot.MWState>;
		loginGetCreateaccountToken(loginOptions?: MWBot.MWOptions): Promise<MWBot.MWState>;

		// CRUD OPERATIONS
		create(
			title: string,
			content: string,
			summary?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		read(
			title: string,
			redirect: boolean,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<MWBot.MWQueryResponse>;
		readText(
			title: string,
			redirect: boolean,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<string>;
		exists: (title: string, customRequestOptions?: MWBot.RequestOptions) => Promise<boolean>;
		readWithProps(
			title: string,
			props: string,
			redirect: boolean,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		edit(
			title: string,
			content: string,
			summary?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<MWBot.MWEditResponse>;
		editOnDifference(
			title: string,
			content: string,
			summary?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<void>;
		update(
			title: string,
			content: string,
			summary?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		delete(
			title: string,
			reason?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		move(
			oldName: string,
			newName: string,
			reason?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		upload(
			title: string | undefined,
			pathToFile: string,
			comment?: string,
			customParams?: object,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		uploadOverwrite(
			title: string | undefined,
			pathToFile: string,
			comment?: string,
			customParams?: object,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		batch(
			jobs: MWBot.BatchJobs | MWBot.BatchJobList,
			summary: string,
			concurrency: number,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;

		sparqlQuery(
			query: string,
			endpointUrl?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
		askQuery(
			query: string,
			apiUrl?: string,
			customRequestOptions?: MWBot.RequestOptions,
		): Promise<any>;
	}

	export = MWBot;
}
