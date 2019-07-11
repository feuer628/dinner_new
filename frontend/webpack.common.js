const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const publicPath = path.resolve(__dirname, "..", "build", "public");
module.exports = {
    entry: {
        app: path.resolve(__dirname, "src", "ts", "application.ts")
    },
    output: {
        path: publicPath,
        filename: "app.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            },
            {
                test: /\.s?css$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            },
            {
                test: /\.(png|jpg|jpeg|gif|woff|svg)$/,
                use: [{loader: 'file-loader', options: {name: "static/[hash].[ext]"}}]
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        plugins: [new TsconfigPathsPlugin({ configFile: "./frontend/tsconfig.json" })]
    },
    plugins: [
        new CopyPlugin([
            { from: path.resolve(__dirname, "src", "index.html"), to: path.resolve(publicPath, "index.html") }
        ])
    ]
};