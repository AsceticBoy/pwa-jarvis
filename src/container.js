import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import initalStore from './stores/initalStore'

const store = initalStore()

export default class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    appSupport: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.initApp = this.initApp.bind(this)
  }

  componentDidMount() {
    this.initApp()
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
          // onupdatefound fired means a new sw being installed
          registration.onupdatefound = () => (console.info('A New Service Worker installed', registration.installing))
        })
        .catch(error => console.error('Register ServiceWorker error', error))
      // when sw active assciate web-push
      navigator.serviceWorker.ready
        .then(registration => {
          console.log(registration.pushManager.getSubscription())
        })
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