/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        beatmaps: './src/beatmaps.ts',
        quests: './src/quests.ts',
        users: './src/users.ts',
        notifications: './src/notifications.ts',
        admin: './src/admin.ts',
        artists: './src/artists.ts',
        judging: './src/judging.ts',
        adminContests: './src/admin/contests.ts',
        adminBeatmaps: './src/admin/beatmaps.ts',
        adminQuests: './src/admin/quests.ts',
        adminUsers: './src/admin/users.ts',
        adminFeaturedArtists: './src/admin/featuredArtists.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/js/'),
        publicPath: '/js/',
    },
    mode: 'development',
    devtool: '#eval-source-map',
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
        new HtmlWebpackPlugin({
            chunks: ['beatmaps'],
            filename: path.resolve(__dirname, 'views/beatmaps.ejs'),
            template: 'views/base.ejs',
        }),
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@src': path.resolve(__dirname, 'src/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
        },
    },
    devServer: {
        publicPath: '/js/',
        stats: 'minimal',
        port: 8080,
        proxy: {
            '/': 'http://localhost:3000',
        },
    },
    externals: {
        jquery: 'jQuery',
        axios: 'axios',
    },
};
