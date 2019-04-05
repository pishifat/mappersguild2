const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');

const config = {
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
            vue: 'vue/dist/vue.js' // TOCHANGE vue.min.js
        }
    },
    devServer: {
        publicPath: '/javascripts/',
        port: 8080,
        proxy: {
        '/': 'http://localhost:3000'
        }
    }
};

const mgConfig = Object.assign({}, config, {
    name: 'mg',
    entry: {
        maps: './src/maps.js',
        mapsarchive: './src/mapsarchive.js',
        quests: './src/quests.js',
        questsarchive: './src/questsarchive.js',
        parties: './src/parties.js',
        users: './src/users.js',
        notifications: './src/notifications.js',
        admin: './src/admin.js',
        //notificationsComponent: './src/notificationsComponent.js', // Whenever need to rebuild the notif thing at bottom
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/javascripts/'),
        publicPath: '/'
    },
});

const qatConfig = Object.assign({}, config, {
    name: 'qat',
    entry: {
        appEval: './QAT/src/appEval.js',
        bnEval: './QAT/src/bnEval.js',
        dataCollection: './QAT/src/dataCollection.js',
        evalArchive: './QAT/src/evalArchive.js',
        manageReports: './QAT/src/manageReports.js',
        qatUsers: './QAT/src/qatUsers.js',
        vetoes: './QAT/src/vetoes.js',
        manageTest: './QAT/src/manageTest.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'QAT/public/javascripts/'),
        publicPath: '/QAT/'
    },
});

module.exports = [
    mgConfig, qatConfig,
];
