/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: {
        app: './src/app.ts',
    },
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
                    configFile: path.join(__dirname, './tsconfig.src.json'),
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@components': path.resolve(__dirname, 'src/components/'),
            '@pages': path.resolve(__dirname, 'src/pages/'),
            '@store': path.resolve(__dirname, 'src/store/'),
            '@interfaces': path.resolve(__dirname, 'interfaces'),
        },
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    externals: {
        jquery: '$',
    },
};
