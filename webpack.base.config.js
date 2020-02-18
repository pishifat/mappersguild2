// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        logs: './src/logs.ts',
        notificationsComponent: './src/notificationsComponent.ts',
    },
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
                // name: '[name].[ext]',
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
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@src': path.resolve(__dirname, 'src/'),
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
        },
    },
    externals: {
        jquery: '$',
    },
};
