const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
    mode: "production",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js"
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
});