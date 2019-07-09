const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: "./src/ts/application.ts"
    },
    output: {
        filename: 'app.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules|dist/
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
        }
    },
    plugins: [
        new CopyPlugin([
            { from: 'src/index.html', to: 'index.html' }
        ])
    ]
};