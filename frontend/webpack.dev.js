const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    devServer: {
        contentBase: path.resolve(__dirname, "..", "build", "public"),
        compress: true,
        port: 80
    },
    mode: "development",
    devtool: 'inline-source-map'
});