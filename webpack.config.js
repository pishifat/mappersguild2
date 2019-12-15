const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = {
    entry: {
        maps: './src/maps.js',
        users: './src/users.js',
        notifications: './src/notifications.js',
        admin: './src/admin.js',
        artists: './src/artists.js',
        quests: './src/quests.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/javascripts/'),
        publicPath: '/'
    },
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        outputPath: '../images'
                    }
                }]
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js',
        },
    },
    devServer: {
        publicPath: '/javascripts/',
        port: 8080,
        proxy: {
          '/': 'http://localhost:3000'
        }
    }
};
