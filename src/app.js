import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Redbox from 'redbox-react'
import App from './container'

const ROOT = document.getElementById('root')

const render = (Component) => {
  ReactDOM.render(
    <Component />,
    ROOT
  )
}

const __DEV__Render = (Component) => {
  ReactDOM.render(
    <AppContainer errorReporter={Redbox}>
      <Component />
    </AppContainer>,
    ROOT
  )
}

if (__DEV__) {
  // first render must need
  __DEV__Render(App)
  if (module.hot) {
    console.info('Webpack HotModuleReplace open')
    module.hot.accept('./container', () => {
      console.info('Webpack HotModuleReplace callback')
      // https://github.com/gaearon/react-hot-boilerplate/pull/61#issuecomment-255515129
      // issue: https://github.com/webpack/webpack-dev-server/issues/100 @Armour
      // 坑死了，居然目前还不支持刷新
      const NextApp = require('./container').default;
      __DEV__Render(NextApp)
    })
  }
} else {
  // if 'production mode' or 'hotModuleReplace not open'
  render(App)
}
