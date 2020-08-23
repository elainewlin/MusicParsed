import path from "path";
import webpack from "webpack";
import CleanWebpackPlugin from "clean-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import OptimizeCssAssetsPlugin from "optimize-css-assets-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import WebpackManifestPlugin from "webpack-manifest-plugin";

const config: webpack.Configuration = {
  entry: {
    convert: "./web/convert/convert.ts",
    index: "./web/index.ts",
    renderChords: "./web/renderChords.ts",
    showAllSongs: "./web/showAllSongs.ts",
    editSongs: "./web/editSongs.ts",
    parser: "./lib/parser.ts",
    global: "./web/global.ts",
  },
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "static", "dist"),
    publicPath: "/static/dist/",
  },
  module: {
    rules: [
      {
        test: /\.(?:js|ts)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
      {
        test: /\.mustache$/,
        loader: "mustache-loader",
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              sourceMap: true,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(eot|png|svg|ttf|woff|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 8192,
        },
      },
    ],
  },
  node: false,
  optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          map: true,
        },
      }),
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(["static/dist"]),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css",
    }),
    new WebpackManifestPlugin({
      publicPath: "/static/dist/",
    }),
    new webpack.ProvidePlugin({
      jQuery: "jquery",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  devtool: "source-map",
};

export default config;
