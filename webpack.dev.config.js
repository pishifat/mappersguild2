/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');

module.exports = merge(base, {
    output: {
        path: path.resolve(__dirname, './public/'),
        filename: 'js/[name].js',
    },
    mode: 'development',
    devtool: 'eval-cheap-source-map',
    resolve: {
        alias: {
            vue$: 'vue/dist/vue.esm.js',
        },
    },
    devServer: {
        contentBase: './public',
        stats: 'minimal',
        port: 8080,
        hot: true,
        proxy: {
            '/': 'http://localhost:3000',
        },
    },
});
