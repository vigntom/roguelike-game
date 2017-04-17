#!/bin/sh

# "autoprefixer"
# "babel-core"
# "babel-eslint"
# "babel-loader"
# "babel-preset-es2015"
# "babel-preset-react"
# "css-loader"
# "eslint"
# "eslint-config-airbnb"
# "eslint-config-airbnb-base"
# "eslint-plugin-import"
# "eslint-plugin-jsx-a11y"
# "eslint-plugin-react"
# "extract-text-webpack-plugin"
# "flow"
# "html-webpack-plugin"
# "node-sass"
# "normalize.css"
# "postcss-loader"
# "postcss-smart-import"
# "raw-loader"
# "react-hot-loader"
# "sass-lint"
# "sass-loader"
# "style-loader"
# "tern"
# "uglify-js"
# "uglifyjs-webpack-plugin"
# "webpack"
# "webpack-dev-server"
# "webpack-merge"
    
#   "scripts": {
#     "test": "",
#     "build": "webpack --env=production",
#     "dev": "webpack-dev-server --env=dev"

#     install
yarn add react react-dom
yarn add --dev webpack webpack-merge webpack-dev-server \
  uglify-js uglifyjs-webpack-plugin \
  raw-loader html-webpack-plugin extract-text-webpack-plugin \
  css-loader style-loader \
  sass-lint node-sass sass-loader \
  autoprefixer normalize.css postcss-smart-import postcss-loader \
  eslint eslint-config-airbnb-base eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react \
  babel-core babel-eslint babel-preset-es2015 babel-preset-react babel-loader \
  tern react-hot-loader

