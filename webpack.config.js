const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        convert: './js/convert/convert.js',
        import: './js/import.js',
        index: './js/index.js',
        showAllSongs: './js/showAllSongs.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'static', 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }, {
            test: /\.mustache$/,
            loader: 'mustache-loader'
        }, {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            test: /\.(eot|png|svg|ttf|woff|woff2)$/,
            loader: 'url-loader',
            options: {
                limit: 8192
            }
        }]
    }
};