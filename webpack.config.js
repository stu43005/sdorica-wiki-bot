import { CleanWebpackPlugin } from "clean-webpack-plugin";
import glob from "glob";
import * as _ from "lodash-es";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entry = _.keyBy(
	glob.sync(path.resolve(__dirname, "./dist/viewerjs/entry/*.js")).map((file) =>
		file.includes("$ViewerInit")
			? file
			: {
					import: file,
					dependOn: "$ViewerInit",
			  },
	),
	(file) => path.basename(typeof file === "string" ? file : file.import, ".js"),
);
console.log(entry);

export default {
	entry: entry,
	devtool: false,
	plugins: [new CleanWebpackPlugin()],
	output: {
		filename: "[name].bundle.js",
		path: path.resolve(__dirname, "dist/viewerjs/dist"),
		library: "[name]",
		// libraryExport: 'default',
		libraryTarget: "self",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	mode: "development",
	optimization: {
		usedExports: true,
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".json"],
		fallback: {
			assert: false,
			buffer: false,
			constants: false,
			crypto: false,
			fs: false,
			http: false,
			https: false,
			net: false,
			os: false,
			path: false,
			querystring: false,
			readline: false,
			stream: false,
			tls: false,
			url: false,
			util: false,
			zlib: false,
		},
	},
	externals: [
		"config",
		"csv-stringify",
		"msgpack5",
		"request",
		"stream-to-promise",
		"xlsx",
		{
			"node-fetch": "fetch",
		},
		{
			"node:child_process": "commonjs child_process",
			"node:fs": "commonjs fs",
			"node:fs/promises": "commonjs fs/promises",
			"node:module": "commonjs module",
			"node:path": "commonjs path",
			"node:process": "commonjs process",
			"node:readline": "commonjs readline",
			"node:stream": "commonjs stream",
			"node:url": "commonjs url",
			"node:util": "commonjs util",
		},
	],
	externalsType: "window",
};
