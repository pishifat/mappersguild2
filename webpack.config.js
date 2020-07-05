/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { entry, rules, resolve, externals } = require('./webpack.base.config');
const path = require('path');

module.exports = {
    entry,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/js/'),
        publicPath: '/',
    },
    mode: 'development',
    devtool: '#eval-source-map',
    module: {
        rules,
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    resolve,
    devServer: {
        publicPath: '/js/',
        stats: 'minimal',
        port: 8080,
        hot: true,
        proxy: {
            '/': 'http://localhost:3000',
        },
    },
    externals,
};
