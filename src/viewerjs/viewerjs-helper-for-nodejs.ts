import axios from "axios";
import config from "config";
import Vue from "vue";
import VueAxios from "vue-axios";
import { ViewerJSHelper } from "./viewerjs-helper";

let vue: Vue;

export function getViewerJSHelper(): ViewerJSHelper {
	if (!vue) {
		Vue.use(
			VueAxios,
			axios.create({
				baseURL: `https://${config.get("siDomain")}/`,
				headers: {
					cookie: config.get("siCookie"),
					"Content-Type": "application/json",
				},
				timeout: 60000,
			})
		);
		vue = new Vue();
	}
	return {
		vue,
	} as any;
}
