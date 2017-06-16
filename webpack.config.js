var HtmlPlugin = require('html-webpack-plugin');
var path = require('path');
var WebpackShellPlugin = require('webpack-shell-plugin');
var webpack = require('webpack');

// webpack.config.js
module.exports = {
  entry: './app',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        },
        // match files based on pattern
        test: /\.js$/,
        // ignore files matching pattern
        exclude: ['/node_modules/', '/app/deps/']
      }
    ]
  },
  resolve: {
    root: path.resolve('./node_modules'),
    extensions: ['', '.js']
  },
  plugins: [

    /*
      copy app index and include
      built script path
     */
    new HtmlPlugin({
      template: 'app/index.html'
    }),

    /*
      When we build dist, run this file
     */
    new WebpackShellPlugin({
        onBuildEnd: 'node compile-dist.js'
    }),

    /*
      Make jQuery Global
     */
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
    })

  ]
};