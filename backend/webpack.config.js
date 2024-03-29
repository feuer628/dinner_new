const path = require('path');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const buildPath = path.resolve(__dirname, "..", "build");
module.exports = {
    entry: {
        app: path.resolve(__dirname, "src", "app.ts")
    },
    output: {
        path: buildPath,
        filename: 'app.js'
    },
    target: 'node',
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false,   // if you don't put this is, __dirname
        __filename: false,  // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        plugins: [new TsconfigPathsPlugin({ configFile: "./backend/tsconfig.json" })]
    },
    plugins: [
        // TODO Перенести копирование .env файла в prod-конфиг, т.к. нужно только для сборки production
        // new CopyPlugin([
        //     { from: path.resolve(__dirname, "..", ".env"), to: path.resolve(buildPath) }
        // ])
]
};