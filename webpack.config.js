const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path');

module.exports = {
    entry: {
        maps: './src/maps.js',
        parties: './src/parties.js',
        quests: './src/quests.js',
        users: './src/users.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/javascripts/')
    },
    mode: 'development', // TOCHANGE production
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
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.js' // TOCHANGE vue.min.js
        }
    }
};
