
// service-worker.js record the liftcycle event focus

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
          let request = new Request(reqUrl)
          return fetch(request)
            .then(function (response) {
              if (response.status >= 400) {
                throw new Error(
                  'request for' + requrl + 'failed with status' + response.statusText
                )
              }
              return cache.put(cacheUri, response)
            })
            .catch(function (error) {
              console.error('fetch error with url' + reqUrl + 'occur' + error)
            })

          Promise.all(allCachePromise).then(function () {
            console.info('all prefetch file cache completed.')
          })
        })
      })
      .catch(error => console.error('predetch cache error', error))
  )
})

