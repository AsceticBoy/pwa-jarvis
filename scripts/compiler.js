'use strict'

var fse = require('fs-extra')
var webpack = require('webpack')
var debug = require('debug')('app:webpack:compile')
var webpackConfig = require('../config/webpack.config.js')

const webpackCompile = () => {
  new Promise(function (resolve, reject) {
    const compiler = webpack(webpackConfig)
    // run
    compiler.run((error, stats) => {
      if (error) {
        debug('Webpack compile error err output: ', error)
        return reject(error)
      }
      const info = stats.toJson()
      resolve(info)
    })
  })
}