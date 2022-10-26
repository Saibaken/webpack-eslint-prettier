const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCSSPlugin = require('mini-css-extract-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const plugins = () => {
	const plugins = [
		new HTMLWebpackPlugin({
			template: './index.html',
			minify: {
				collapseWhitespace: isProd,
			},
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'src/public'),
					to: path.resolve(__dirname, 'build/public'),
				},
			],
		}),
		new MiniCSSPlugin({
			filename: '[name].[contenthash].css',
		}),
		new CSSMinimizerPlugin(),
	]

	if (isDev) {
		plugins.push(new webpack.HotModuleReplacementPlugin())
		plugins.push(new ESLintPlugin())
	}

	return plugins
}

const jsLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: {
				presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-proposal-optional-chaining']
			},
		},
	]

	if (isDev) loaders.push('eslint-loader')

	return loaders
}

const optimizations = () => {
	const config = {
		splitChunks: {
			chunks: 'all',
		},
	}

	if (isProd) {
		config.minimizer = [new CSSMinimizerPlugin(), new TerserWebpackPlugin()]
		config.minimize = isProd
	}

	return config
}

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './index.js'],
	},
	optimization: optimizations(),
	output: {
		filename: '[name].[contenthash].js',
		path: path.resolve(__dirname, 'build'),
	},
	resolve: {
		alias: {
			'@assets': path.resolve(__dirname, 'src/assets'),
		},
	},
	plugins: plugins(),
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
			{
				test: /\.css$/,
				use: [MiniCSSPlugin.loader, 'css-loader'],
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				use: ['file-loader'],
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: ['file-loader'],
			},
		],
	},
	devServer: {
		port: 3000,
		hot: isDev,
	},
}
