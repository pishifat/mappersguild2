/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { entry, rules, externals } = require('./webpack.base.config');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry,
    output: {
        path: path.resolve(__dirname, 'public/'),
        filename: 'js/[name].js',
        publicPath: '/',
        chunkFilename: '[name].[chunkhash].js',
    },
    mode: 'development',
    devtool: 'eval-cheap-source-map',
    module: {
        rules,
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@': path.resolve(__dirname, 'src/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
            '@store': path.resolve(__dirname, 'src/store/'),
            '@interfaces': path.resolve(__dirname, 'interfaces'),
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
    externals,
};
