'use strict'

var server = require('../server/server.js')
var debug = require('debug')('app:scripts:bootstrap')
var config = require('../config/global.config.js')

server.listen(config.port)
debug(`Server bootstrap on http://localhost:${config.port}`)