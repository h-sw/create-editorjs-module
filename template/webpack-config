
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '/dist'),
    library: 'Math',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader?removeSVGTagAttrs=false'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'bundle.css'})
  ]
};