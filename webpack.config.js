const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const WebpackManifestPlugin = require("webpack-manifest-plugin");

module.exports = {
  entry: {
    convert: "./js/convert/convert.js",
    index: "./js/index.js",
    renderChords: "./js/renderChords.js",
    showAllSongs: "./js/showAllSongs.js",
    global: "./css/global.css",
  },
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "static", "dist"),
    publicPath: "/static/dist/"
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader"
    }, {
      test: /\.mustache$/,
      loader: "mustache-loader"
    }, {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader, {
          loader: "css-loader",
          options: {
            importLoaders: 1,
          },
        }, {
          loader: "postcss-loader",
        }
      ],
    }, {
      test: /\.(eot|png|svg|ttf|woff|woff2)$/,
      loader: "url-loader",
      options: {
        limit: 8192
      }
    }]
  },
  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin,
      new TerserPlugin,
    ],
  },
  plugins: [
    new CleanWebpackPlugin(["static/dist"]),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
    new WebpackManifestPlugin({
      publicPath: "/static/dist/"
    }),
    new webpack.ProvidePlugin({
      jQuery: "jquery"
    })
  ],
};