(function () {
  'use strict'

  var config = require('./global.config.js')
  var webpackHotClient= require(`webpack-hot-middleware/client?path=/__webpack_hmr&reload=true&timeout=10000`)

  webpackHotClient.subscribe(function (payload) {
    if (payload.action === 'reload' || payload.reload === true) {
      window.location.reload()
    }
  })

  module.exports = webpackHotClient
})()