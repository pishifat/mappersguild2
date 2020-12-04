/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { entry, rules, externals } = require('./webpack.base.config');
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
        new CopyPlugin(
            {
                patterns: [
                    { from: 'public', to: path.resolve(__dirname, 'dist/public') },
                    { from: 'views', to: path.resolve(__dirname, 'dist/views') },
                ],
            }),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vue$: 'vue/dist/vue.min.js',
            '@': path.resolve(__dirname, 'src/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
            '@interfaces': path.resolve(__dirname, 'interfaces'),
        },
    },
    externals,
    // webpack 5 is supposed to handle optimization better now ?
    // optimization: {
    //     moduleIds: 'hashed',
    //     runtimeChunk: 'single',
    //     splitChunks: {
    //         cacheGroups: {
    //             vendors: {
    //                 test: /[\\/]node_modules[\\/]/,
    //                 name: 'vendors',
    //                 chunks: 'all',
    //             },
    //         },
    //     },
    // },
};
