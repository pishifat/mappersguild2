/* eslint-disable @typescript-eslint/no-var-requires */
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = {
    entry: {
        maps: './src/beatmaps.ts',
        // users: './src/users.js',
        // notifications: './src/notifications.js',
        // admin: './src/admin.js',
        // artists: './src/artists.js',
        // quests: './src/quests.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/javascripts/'),
        publicPath: '/',
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
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@src': path.resolve(__dirname, 'src/'),
            '@srcModels': path.resolve(__dirname, 'src/models/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages/*': path.resolve(__dirname, 'src/pages/'),
        },
    },
    devServer: {
        publicPath: '/javascripts/',
        stats: 'minimal',
        port: 8080,
        proxy: {
            '/': 'http://localhost:3000',
        },
    },
    externals: {
        jquery: 'jQuery',
    },
};
