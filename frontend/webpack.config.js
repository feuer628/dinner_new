var path = require('path');
var webpack = require('webpack');
var PrerenderSpaPlugin = require('prerender-spa-plugin');
const {VueLoaderPlugin} = require("vue-loader");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/ts/main.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                loader: 'vue-style-loader!css-loader!sass-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                },
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },


    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        extensions: ['.ts', '.js', '.json', '.css', '.vue']
    },
    devServer: {
        historyApiFallback: true,
        noInfo: true
    },
    performance: {
        hints: false
    },
    devtool: '#eval-source-map',

    plugins: [
        // new PrerenderSpaPlugin(
        //     // Absolute path to compiled SPA
        //     path.join(__dirname, '.'),
        //     // List of routes to prerender
        //     ['/', '/post/1', '/post/2', '/post/3', '/post/4'],
        //     {
        //         captureAfterTime: 10000,
        //     }
        // ),
        new VueLoaderPlugin()
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                test: /\.[tj]s(\?.*)?$/i,
            }),
        ],
    }
};


