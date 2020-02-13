/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        maps: './src/beatmaps.ts',
        users: './src/users.ts',
        notifications: './src/notifications.ts',
        admin: './src/admin.ts',
        artists: './src/artists.ts',
        quests: './src/quests.ts',
        judging: './src/judging.ts',
        //notificationsComponent: './src/notificationsComponent.js', // Whenever need to rebuild the notif thing at bottom
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/public/javascripts/'),
        publicPath: '/',
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
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin([
            { from: 'public', to: path.resolve(__dirname, 'dist/public') },
            { from: 'views', to: path.resolve(__dirname, 'dist/views') },
        ]),
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
};
