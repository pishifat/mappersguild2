/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { entry } = require('./webpack.base.config');
const path = require('path');

module.exports = {
    entry: {
        ...entry,
        //notificationsComponent: './src/notificationsComponent.js', // Whenever need to rebuild the notif thing at bottom
    },
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist/public/js/'),
        publicPath: '/js/',
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                },
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        outputPath: '../images',
                    },
                }],
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader'],
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader',
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            { from: 'public', to: path.resolve(__dirname, 'dist/public') },
            { from: 'views/error.ejs', to: path.resolve(__dirname, 'dist/public/views') },
            { from: 'views/index.ejs', to: path.resolve(__dirname, 'dist/public/views') },
            { from: 'views/faq.ejs', to: path.resolve(__dirname, 'dist/public/views') },
            { from: 'views/layout.ejs', to: path.resolve(__dirname, 'dist/public/views') },
        ]),
        new HtmlWebpackPlugin({
            chunks: ['beatmaps', 'vendors', 'runtime'],
            filename: path.resolve(__dirname, 'dist/views/beatmaps.ejs'),
            template: 'views/base.ejs',
        }),
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vue$: 'vue/dist/vue.min.js',
            '@src': path.resolve(__dirname, 'src/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
        },
    },
    externals: {
        jquery: 'jQuery',
        axios: 'axios',
    },
    optimization: {
        moduleIds: 'hashed',
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
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
