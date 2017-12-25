import React from 'react'
import { Provider } from 'react-redux'
import initalStore from './stores/initalStore'

const store = initalStore()

export default class App extends React.Component {
  render() {
    console.log('hhhd')
    return (
      <Provider store={store}>
        <h1>hello dddss点点滴滴shh</h1>
      </Provider>
    )
  }
}