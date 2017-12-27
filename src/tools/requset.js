// use fetch request encapsulation
const SEPARATOR = '/'
const _BASE_PREFIX = 'api/v2'
const _BASE_OPTION = {
  method: 'GET',
  credentials: 'include',
  headers: {
    "Content-Type": "application/json"
  }
}

function split(base, addition) {
  return addition.charAt(0) === SEPARATOR
    ? base.concat(addition)
    : base.concat(SEPARATOR, addition)
}

function checkUrl(url) {
  if (url.startsWith(_BASE_PREFIX)) {
    return url
  }
  return split(_BASE_PREFIX, url)
}

function checkOption(option) {
  return Object.assign({}, _BASE_OPTION, option)
}

function appFetch(url, option = {}) {
  let sendUrl = checkUrl(url)
  let sendOptions = checkOption(option)
  return fetch(sendUrl, sendOptions)
    .then(res => {
      if (res.status >= 400) {
        return Promise.reject(new Error(
          `Request for ${sendUrl} has error failed code: ${res.status}, text: ${res.statusText}`
        ))
      }
      return Promise.resolve(res)
    })
    .catch(error => Promise.reject(new Error(
      `Request for ${sendUrl} has error failed ${error}`
    )))
}

export {
  default as appFetch
}