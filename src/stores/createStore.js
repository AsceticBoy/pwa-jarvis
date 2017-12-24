import { createStore, applyMiddleware } from 'redux'
import registerReducer from './combineReducers.js'

const middleware = []

export default function createStore(initalState = {}) {
  registerReducer(),
  initalState,
  applyMiddleware(...middleware)
}