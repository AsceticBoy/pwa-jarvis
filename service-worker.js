
// service-worker.js record the liftcycle event focus
importScripts('./src/tools/request.js')

// global service-worker config
let _CACHE_VERSION = 1
let _CACHE_INFO = {
  prefetch: {
    name: 'prefetch-cache-v' + _CACHE_VERSION,
    uri: [
      'index.html',
      'polyfill.js',
      'vendors.js'
    ]
  }
}
// focus service-worker installing
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(_CACHE_INFO.prefetch.name)
      .then(cache => {
        console.info('cache open', _CACHE_INFO.prefetch.name)
        let allCachePromise = _CACHE_INFO.prefetch.uri.map(cacheUri => {
          let reqUrl = new URL(cacheUri, location.href)
          return appFetch(reqUrl)
            .then()
        })
      })
      .catch(error => console.error('predetch cache error', error))
  )
})

