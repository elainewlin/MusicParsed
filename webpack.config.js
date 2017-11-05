const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        convert: './js/convert/convert.js',
        import: './js/import.js',
        index: './js/index.js',
        showAllSongs: './js/showAllSongs.js',
        styles: './js/styles.js',
    },
    output: {
        filename: '[name].[chunkhash].bundle.js',
        path: path.resolve(__dirname, 'static', 'dist'),
        publicPath: '/static/dist/'
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
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1,
                    },
                }, {
                    loader: 'postcss-loader',
                }],
            }),
        }, {
            test: /\.(eot|png|svg|ttf|woff|woff2)$/,
            loader: 'url-loader',
            options: {
                limit: 8192
            }
        }]
    },
    plugins: [
        new CleanWebpackPlugin(['static/dist']),
        new WebpackManifestPlugin({
            publicPath: '/static/dist/'
        }),
        new ExtractTextPlugin('[name].[contenthash].css'),
        new webpack.ProvidePlugin({
            jQuery: 'jquery'
        })
    ],
};
