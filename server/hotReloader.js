(function () {
  'use strict'

  var chokidar = require('chokidar')
  var config = require('../config/global.config.js')
  var debug = require('debug')('app:hotReloader:listen')

  // listen file change
  function activate(server) {

    const watcher = chokidar.watch([
      config.paths.assets('template/index.html') // listen index.html
    ], { persistent: true })

    // init
    watcher
      .on('addDir', function (path) {
        debug('HotReloader watcher file dir: ', path)
      })
      .on('error', function (error) {
        debug('HotReloader watcher error', error)
      })
      .on('ready', function () {
        debug('HotReloader watcher ready complete')
      })

    // register event
    watcher.on('change', function (path) {
      debug(`HotReloader file ${path} onchange client reload.`)
      server.reloadClient();
    })
  }

  module.exports = {
    activate
  }
})()