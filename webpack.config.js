const path = require("path");
const glob = require("glob");
const _ = require("lodash");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const entry = _.keyBy(glob.sync(path.resolve(__dirname, './src/viewerjs/entry/*.ts')).map(file => file.includes('$ViewerInit') ? file : ({
	import: file,
	dependOn: '$ViewerInit'
})), (file) => path.basename(typeof file === 'string' ? file : file.import, '.ts'));
console.log(entry);

module.exports = {
	entry: entry,
	devtool: false,
    plugins: [
		new CleanWebpackPlugin(),
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist/viewerjs'),
		library: '[name]',
		// libraryExport: 'default',
		libraryTarget: 'this',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	mode: 'development',
	optimization: {
		usedExports: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.json'],
		fallback: {
			'assert': false,
			'constants': false,
			'crypto': false,
			'fs': false,
			'http': false,
			'https': false,
			'net': false,
			'path': false,
			'querystring': false,
			'readline': false,
			'stream': false,
			'tls': false,
			'url': false,
			'zlib': false,
		}
	},
	externals: [
		'config',
		'csv-stringify',
		'fs-extra',
		'msgpack5',
		'request',
		'stream-to-promise',
		'xlsx',
		{
			'node-fetch': 'fetch',
		},
	],
	externalsType: 'window',
};
