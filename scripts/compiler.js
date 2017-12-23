'use strict'

var fse = require('fs-extra')
var webpack = require('webpack')
var debug = require('debug')('app:webpack:compile')
var config = require('../config/global.config.js')
var webpackConfig = require('../config/webpack.config.js')

const webpackCompile = (webpackConfig) => {
  return new Promise(function (resolve, reject) {
    const compiler = webpack(webpackConfig)
    // run
    compiler.run((error, stats) => {
      if (error) {
        debug('Webpack compile \'error\' output: ', error.stack || error)
        if (error.details) {
          debug('Webpack compile \'error detail\' output: ', error.details)
        }
        return reject(error)
      }
      const info = stats.toJson()
      if (stats.hasErrors()) {
        debug('Webpack compile \'stats error\' output: ')
        debug(info.errors.join('\n'))
        return reject(info.errors)
      }
      debug('Webpack compile completed.')
      debug(stats.toString(config.compiler.stats))
      if (stats.hasWarnings()) {
        debug('Webpack compile \'warnings\' output :')
        debug(info.warnings.join('\n'))
      }
      resolve(info)
    })
  })
}

const compile = () => {
  debug('Start compile')
  return webpackCompile(webpackConfig)
    .then((info) => {
      if (info.warnings.length && !config.compiler.allow_warning) {
        throw new Error('Global.config not allow webpack compile has warning, you can change it')
      }
    })
    .then(() => {
      debug('Webpack compile successfully')
    })
    .catch((error) => {
      debug('Compile catch error output: ', error)
      process.exit(1)
    })
}

compile()