const webpack = require("webpack")
const autoprefixer = require("autoprefixer")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpackMerge = require("webpack-merge")

const baseConfig = require("./base.js")

module.exports = function(root) {
  return webpackMerge(
    baseConfig(root), {
      devtool: "inline-source-map", //"cheap-eval-source-map",
      entry: [
        "react-hot-loader/patch",
        "webpack-dev-server/client?http://127.0.0.1:8080",
        "webpack/hot/only-dev-server",
        "./app-dev.js"
      ],
      devServer: {
        hot: true,
        contentBase: "./dist",
        publicPath: "/"
      },
      module: {
        rules: [
          {
            test: /\.html$/,
            loader: "raw-loader"
          },
          {
            test: /\.scss$/,
            use: [
              "style-loader",
              "css-loader",
              "postcss-loader",
              "sass-loader"
            ]
          }
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify("development")
        }),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
          template: "./index.html"
        }),
        new webpack.NamedModulesPlugin()
      ]
    }
  )
}

