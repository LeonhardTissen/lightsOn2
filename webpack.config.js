const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = (_env, argv) => ({
	entry: './src/main.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].[contenthash].js',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /.+\.(png|svg|webmanifest|ttf)$/,
				type: 'asset/resource',
			},
			{
				test: /.+\.spritesheet.png$/,
				use: [
					{ loader: 'file-loader' }, // needed because extract-loader doesn't support asset/resource
				],
			},
			{
				test: /\.spritesheet\.json$/,
				type: 'asset/resource',
				use: [
					{
						loader: 'extract-loader',
						options: {
							publicPath: '', // https://github.com/peerigon/extract-loader/issues/95
						},
					},
					{ loader: 'ref-loader' },
				],
			},
			{
				// despite taking more space, files load faster that way
				test: /imgs\/game\/.+\.(png|svg)$/,
				type: 'asset/inline',
			},
			{
				test: /\.(vert|frag)$/,
				type: 'asset/source',
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
			},
			{
				test: /\.ts$/,
				use: ['babel-loader', 'ts-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: 'babel-loader',
			},
			{
				test: /\.webmanifest$/,
				use: ['webpack-webmanifest-loader'],
			},
			{
				// regex that doesn't match in dev
				test: argv.mode === 'development' ? /a^/ : /\.js$/,
				exclude: [
					/node_modules/,
				],
				enforce: 'post',
				use: {
					loader: WebpackObfuscator.loader,
					options: {
						seed: '© Warze.org 2023',
						sourceMap: true,
					},
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: false,
			xhtml: true,
		}),
		new MiniCssExtractPlugin({
			filename: '[name].[contenthash].css',
		}),
	],
	devtool: argv.mode === 'development' ? 'eval-source-map' : 'hidden-source-map',
});
