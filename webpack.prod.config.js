/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(base, {
    output: {
        path: path.resolve(__dirname, 'dist/public/'),
        filename: 'js/[name].[contenthash].js',
        chunkFilename: 'js/[name].[contenthash].js',
        publicPath: '/',
    },
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css',
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'views/template.html'),
            filename: path.join(__dirname, 'dist/views/index.hbs'),
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public', to: path.resolve(__dirname, 'dist/public') },
                { from: 'views/error.hbs', to: path.resolve(__dirname, 'dist/views/') },
            ],
        }),
    ],
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.min.js',
        },
    },
    optimization: {
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
});
