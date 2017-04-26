const path = require('path')

module.exports = function (root) {
  return {
    context: path.resolve(root, 'src'),
    output: {
      path: path.resolve(root, 'build'),
      filename: ('./bundle.js')
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.css', '.scss', 'html'],
      alias: {
        normalize: 'normalize.css/normalize.css'
      }
    }
  }
}
