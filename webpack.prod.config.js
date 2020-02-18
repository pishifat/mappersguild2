/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { entry, rules, resolve, externals } = require('./webpack.base.config');
const path = require('path');

module.exports = {
    entry,
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist/public/js/'),
        publicPath: '/',
    },
    mode: 'production',
    module: {
        rules,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new CopyPlugin([
            { from: 'public', to: path.resolve(__dirname, 'dist/public') },
            { from: 'views', to: path.resolve(__dirname, 'dist/views') },
        ]),
        new ManifestPlugin({
            fileName: path.resolve(__dirname, 'dist/manifest.json'),
            publicPath: '/js/',
            filter: (file) => file.name.endsWith('.js'),
        }),
    ],
    resolve,
    externals,
    optimization: {
        moduleIds: 'hashed',
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
};
