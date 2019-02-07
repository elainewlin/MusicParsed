import path from "path";
import webpack from "webpack";
import CleanWebpackPlugin from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebpackManifestPlugin from "webpack-manifest-plugin";

const config: webpack.Configuration = {
  entry: {
    convert: "./ts/convert/convert.ts",
    index: "./ts/index.ts",
    renderChords: "./ts/renderChords.ts",
    showAllSongs: "./ts/showAllSongs.ts",
    global: "./css/global.css",
  },
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "static", "dist"),
    publicPath: "/static/dist/"
  },
  module: {
    rules: [{
      test: /\.(?:js|ts)$/,
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
  node: false,
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
  resolve: {
    extensions: [".ts", ".js"],
  },
};

export default config;
