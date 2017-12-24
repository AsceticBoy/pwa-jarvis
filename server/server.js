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

function createServer() {
  if (__DEV__) {
    const compiler = webpack(webpackConfig)

    // webpack-dev-middleware
    const devModules = webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      lazy: false, // 非只有请求才更新
      hot: false, // 不开启，用module.hot.accept()来优化
      stats: config.compiler.stats
    })
    debug('hhh', webpackConfig.output.publicPath)
    // webpack-hot-middleware
    const hotModules = webpackHotMiddleware(compiler, {
      path: '/__webpack_hmr', // 匹配客户端设置
    })

    app.use(devModules)
    app.use(hotModules)

    // hotReloader
    function reloadClient() {
      hotModules.publish({action: 'reload'})
    }

    // listener
    function listen(port, callback) {
      app.listen(port, callback)
    }
  
    // app.use('*', function (req, res, next) {
    //   const filename = path.join(compiler.outputPath, 'index.html')
    //   compiler.outputFileSystem.readFile(filename, (err, result) => {
    //     if (err) {
    //       return next(err)
    //     }
    //     res.set('content-type', 'text/html')
    //     res.send(result)
    //     res.end()
    //   })
    // })
    return {
      reloadClient,
      listen
    }
  } else {
    debug(
      'Webpack dev Server must live of development mode,' +
      'it compile target bundle folder to project /web,' +
      'if you are production mode I will help you redirect to static files.'
    )
    app.use(express.static(config.paths.web()))

    return app
  }
}

module.exports = createServer()

