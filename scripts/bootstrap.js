'use strict'

var server = require('../server/server.js')
var debug = require('debug')('app:scripts:bootstrap')
var config = require('../config/global.config.js')
var horReloader = require('../server/hotReloader.js')

// Activate custom hotReloader
debug('Open custom hotReloader')
horReloader.activate(server)

// Server open listen port
server.listen(config.port, (error) => {
  if (error) {
    return debug('Webpack dev server fail', error)
  }
})
debug(`Server bootstrap on http://localhost:${config.port}`)