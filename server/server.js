'use strict'

var express = require('express')
var debug = require('debug')('app:webpack:devServer')
var path = require('path')
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var parser = require('body-parser')
var compression = require('compression')
var config = require('../config/global.config.js')
var webpackConfig = require('../config/webpack.config.js')

const app = express()
const __DEV__ = config.global.__DEV__

// other middleware
app.use(compression()) // first because out
app.use(parser.json())

if (__DEV__) {
  const compiler = webpack(webpackConfig)
  // webpack-dev-middleware
  app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    lazy: false, // 非只有请求才更新
    hot: false, // 不开启，用module.hot.accept()来优化
    stats: config.compiler.stats
  }))
  // webpack-hot-middleware
  app.use(webpackHotMiddleware(compiler, {
    path: '/__webpack_hmr'
  }))
} else {
  debug(
    'Webpack dev Server must live of development mode,' +
    'it compile target bundle folder to project /web,' +
    'if you are production mode I will help you redirect to static files.'
  )
  app.use(express.static(config.paths.web()))
}

module.exports = app

