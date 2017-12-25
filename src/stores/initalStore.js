import { createStore, applyMiddleware } from 'redux'
import registerReducer from './combineReducers.js'

const initalState = {}

const middleware = []

export default function initalStore() {
  return createStore(
    registerReducer(),
    initalState,
    applyMiddleware(...middleware)
  )
}