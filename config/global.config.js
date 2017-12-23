'use strict'

var path = require('path')
var packageJson = require('../package.json')
var debug = require('debug')('app:global:config')

// environment difference to difference config
const environment = {
  development: (config) => ({
    compiler: {
      ...config.compiler,
      'public_path': `http://localhost:${config.port}`,
      'hash': false
    }
  }),
  production: (config) => ({
    compiler: {
      ...config.compiler,
      'devtool': false,
      'stats': {
        chunks: true,
        chunkModules: true,
        colors : true,
        warnings: true,
      }
    }
  })
}

// Base Information Configuration
const config = {
  'app_name' : 'Jarvis',
  // ----- environment ----- //
  'env'  : process.env.NODE_ENV || 'development',
  'host' : process.env.HOST || 'localhost',
  'port' : process.env.PORT || 3000,
  // ----- address shortname ----- //
  'dir_root' : path.resolve(__dirname, '..'),
  'shortname_src'    : 'src',
  'shortname_assets' : 'assets',
  'shortname_web' : 'web',
}

config.compiler = {
  'devtool': 'source-map',
  'babel': {
    cacheDirectory: true,
    presets: ['env', 'react', 'stage-0'],
    plugins: ['transform-runtime']
  },
  'vendors': [
    'react',
    'react-dom',
    'react-redux',
    'redux'
  ],
  'public_path': '/',
  'hash': 'hash:8',
  'allow_warning': true,
  'stats': {
    chunks: false,
    chunkModules: false,
    colors : true,
    warnings: true,
  }
}

// filter vendors
config.compiler.vendors = config.compiler.vendors.filter((vendor) => {
  if (packageJson.dependencies[vendor]) return true
  debug('Webpack entry-ventors must need dependency modules' + vendor + 'into package.json')
})

config.global = {
  'process.env'  : {
    'NODE_ENV' : JSON.stringify(config.env)
  }, // 生成环境能减少不少的React包的体积
  'NODE_ENV' : JSON.stringify(config.env),
  '__DEV__'  : config.env === 'development',
  '__TEST__' : config.env === 'test',
  '__PROD__' : config.env === 'production',
}

function attach() {
  var args = [config.dir_root].concat([].slice.apply(arguments))
  return path.resolve.apply(path, args)
}

config.paths = {
  'rootTo' : attach,
  'src' : attach.bind(null, config.shortname_src),
  'assets' : attach.bind(null, config.shortname_assets),
  'web' : attach.bind(null, config.shortname_web)
}
// change config into difference environment
const cover = environment[config.env]
if (cover) {
  debug(`Cover Configuration env is ${config.env}`)
  Object.assign(config, cover(config))
} else {
  debug('Now never have Cover Handler Please check your env keyword or Cover Handler !')
}

module.exports = config


