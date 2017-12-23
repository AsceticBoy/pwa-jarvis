'use strict'

var server = require('../server/server.js')
var debug = require('debug')('app:scripts:bootstrap')
var config = require('../config/global.config.js')

server.listen(config.port, (error) => {
  if (error) {
    return debug('Webpack dev server fail', error)
  }
})
debug(`Server bootstrap on http://localhost:${config.port}`)