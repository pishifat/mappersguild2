const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

module.exports = {
    entry: {
        maps: './src/maps.js',
        mapsarchive: './src/mapsarchive.js',
        users: './src/users.js',
        notifications: './src/notifications.js',
        admin: './src/admin.js',
        artists: './src/artists.js',
        quests: './src/quests.js',
        //notificationsComponent: './src/notificationsComponent.js', // Whenever need to rebuild the notif thing at bottom
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/javascripts/'),
        publicPath: '/'
    },
    mode: 'production',
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
            vue: 'vue/dist/vue.min.js',
        }
    },
};
