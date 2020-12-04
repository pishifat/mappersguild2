/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        app: './src/app.ts',
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
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset/resource',
        },
        {
            test: /\.woff$/i,
            type: 'asset/resource',
        },
        {
            test: /(\.s[ac]ss|\.css)$/i,
            use: [
                process.env.NODE_ENV !== 'production'
                    ? 'vue-style-loader'
                    : MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        esModule: false,
                        url: false,
                    },
                },
                'sass-loader',
            ],
        },
    ],
    externals: {
        jquery: '$',
    },
};
