'use strict'

var config = require('./global.config.js')
var debug = require('debug')('app:webpack:config')
var autoprefixer = require('autoprefixer')
var pxToRem = require('postcss-pxtorem')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CopyPlugin = require('copy-webpack-plugin')
var OpenBrowserPlugin = require('open-browser-webpack-plugin')

const __DEV__ = config.global.__DEV__
const __PROD__ = config.global.__PROD__

const loaderTouch = (loader, regx) => {
  if (typeof loader === 'object') return regx.test(loader.loader)
  return regx.test(loader)
}

debug('Webpack configuration init')
// >>>>> webpack
const webpackConfig = {
  target: 'web',
  resolve: {
    extensions: ['.js', '.json'],
    descriptionFiles: ['package.json']
  },
  devtool: config.compiler.devtool,
  module: {}
}

// >>>>> entry
const entry = {
  polyfill: ['babel-polyfill'],
  vendors: config.compiler.vendors,
  app: [config.paths.src('app.js')] // must be array
}
webpackConfig.entry = __DEV__
  ? Object.assign({}, entry, { app: entry.app.concat(`webpack-hot-middleware/client?path=${config.compiler.public_path}__webpack_hmr`) })
  : Object.assign({}, entry)

// >>>>> output(由于PWA的特殊性，后期考虑在这个位置做应用架构外壳，从而实现缓存)
webpackConfig.output = {
  filename: config.compiler.hash ? `[name]_[${config.compiler.hash}].js` : '[name].js', // 这里到时候可以测试下hash是否会影响CacheStorage的缓存
  path: config.paths.web(),
  publicPath: config.compiler.public_path,
}

// >>>>> externals see: http://www.tangshuang.net/3343.html
webpackConfig.externals = {}

// >>>>> loaders
// js
webpackConfig.module.rules = [{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: config.compiler.babel
  }
}]
// file
webpackConfig.module.rules.push({
  test: /\.(png|jpg|jpeg|gif)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: `image/[name]${config.compiler.hash ? `_[${config.compiler.hash}]` : ''}.[ext]`,
      limit: 8192
    }
  },
  include: config.paths.assets()
},{
  test: /\.(mp3|mp4|wav)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: `audio/[name]${config.compiler.hash ? `_[${config.compiler.hash}]` : ''}.[ext]`,
    },
  },
  include: config.paths.assets()
}, {
  test: /\.(woff|woff2|eot|svg|ttf|otf)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: `font/name]${config.compiler.hash ? `_[${config.compiler.hash}]` : ''}.[ext]`,
    },
  },
  include: config.paths.assets()
})
// styles
webpackConfig.module.rules.push({
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          pxToRem({
            rootValue: 37.5,
            propList: ['*']
          })
        ],
      }
    }
  ]
}, {
  test: /\.less$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        modules: false
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          pxToRem({
            rootValue: 37.5,
            propList: ['*']
          })
        ],
      },
    },
    'less-loader',
  ],
  include: config.paths.src('styles')
})

// >>>>> plugins
webpackConfig.plugins = [
  new webpack.DefinePlugin(config.global),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['vendors', 'polyfill'],
  }),
  new HtmlWebpackPlugin({
    template : config.paths.assets('template/index.html'),
    title    : config.app_name, // 注入模板
    filename : 'index.html',
    inject   : true
  }),
  new CopyPlugin([{
    from: config.paths.rootTo('service-worker.js'),
    to: config.paths.web('service-worker.js')
  }, {
    from: config.paths.rootTo('manifest.json'),
    to: config.paths.web('manifest.json')
  }, {
    from: config.paths.assets('icon'),
    to: config.paths.web('icon')
  }])
]

if (__DEV__) {
  debug('Development plugins add')
  webpackConfig.plugins.push(
    new webpack.NoEmitOnErrorsPlugin(), // 编译错误时跳出输出阶段
    new webpack.HotModuleReplacementPlugin(), // webpack模块热替换
    new OpenBrowserPlugin({
      url: config.compiler.public_path,
    })
  )
} else if (__PROD__) {
  debug('Production pluhins add')
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    })
  )
}

// dirrerence styles
if (__PROD__) {
  debug(`Production use ExtractTextPlugin to style`)
  webpackConfig.module.rules
    .forEach(rule => rule.use && Array.isArray(rule.use) && rule.use.forEach(loader => {
      if (loaderTouch(loader, /postcss-loader/)) loader.options.plugins.unshift(autoprefixer())
    }))

  webpackConfig.module.rules
    .filter(rule => rule.use && Array.isArray(rule.use) && rule.use.some(loader => loaderTouch(loader, /style-loader|css-loader/)))
    .forEach(rule => ExtractTextPlugin.extract({use: rule.use}))

  webpackConfig.plugins.unshift(
    new ExtractTextPlugin({
      filename: config.compiler.hash ? `css/[name]_[${config.compiler.hash}].css` : 'css/[name].css',
      allChunks: true
    })
  )
}

module.exports = webpackConfig