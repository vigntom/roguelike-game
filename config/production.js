const HtmlWebpackPlugin = require("html-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const webpackMerge = require("webpack-merge")

const baseConfig = require("./base.js")

module.exports = function(root) {
  return webpackMerge(
    baseConfig(root), {
      devtool: "source-map",
      entry: "./app.js",
      module: {
        rules: [
          {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: [
                {
                  loader: "css-loader",
                  options: {
                    modules: false,
                    minimize: true
                  }
                },
                "postcss-loader",
                "sass-loader"
              ],
              publicPath: "/dist"
            })
          }
        ]
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: "./index.html"
        }),
        new ExtractTextPlugin({
          filename: "./css/style.css",
          disable: false,
          allChunks: true
        }),
        new UglifyJsPlugin()
      ]
    }
  )
}
