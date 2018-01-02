import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import initalStore from './stores/initalStore'

const store = initalStore()
const update_cycle = 0.5 * 60 * 1000 // ms

export default class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    appSupport: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.initApp = this.initApp.bind(this)
    this.refresh = this.refresh.bind(this)
    this._SW_TIMER = null
  }

  componentDidMount() {
    this.initApp()
  }

  componentWillUnmount() {
    if (this._SW_TIMER) {
      clearInterval(this._SW_TIMER)
    }
  }

  initApp() {
    const { __SW_PROVIDE__, __NOTIFY_PROVIDE__} = this.props.appSupport
    if (__NOTIFY_PROVIDE__) {
      Notification
        .requestPermission()
        .catch(error => console.error('Register Notification API error output: ', error))
    }
    if (__SW_PROVIDE__) {
      navigator.serviceWorker
        .register('service-worker.js', { scope: './' }) // scope is then sw server scope default './'
        .then(registration => {
          this.refresh(update_cycle)
          // onupdatefound fired means a new sw being installed
          registration.onupdatefound = () => {
            console.info('A New Service Worker installed', registration.installing)
          }
        })
        .catch(error => console.error('Register ServiceWorker error', error))
      // serviceWorker.ready会一直等到SW的状态魏actived时返回当前actived的registration
      // when sw active assciate web-push
      navigator.serviceWorker.ready
        .then(registration => {
          // 可在此处做Sync的Service-worker请求
          
        })
    }
  }

  // 总有一些资源需要在一定时间进行更行 --> 比如又缓存分级的情况
  refresh(cycle) {
    if (navigator.serviceWorker.controller) {
      console.log('send refresh ::')
      this._SW_TIMER = setInterval(() => {
        // extends Worker.method
        navigator.serviceWorker.controller.postMessage([
          'index.html',
          'polyfill.js',
          'vendors.js'
        ])
      }, cycle)
    }
  }

  render() {
    return (
      <Provider store={store}>
        <h1>hello dddss点点滴滴shh</h1>
      </Provider>
    )
  }
}