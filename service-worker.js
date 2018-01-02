
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
  },
  duration: {
    name: 'duration-cache-v' + _CACHE_VERSION,
    uri: []
  }
}

// compare file to file
function checkFile(url, file) {
  
}

// focus service-worker installing
self.addEventListener('install', function (event) {
  console.log('Service-worker begin install event')
  // skipWaiting视情况而定，可以跳过SW更改后新SW waitting的状态，马上进行替换
  // self.skipWaiting()
  var now = Date.now();
  // 首次缓存资源如果过大是有可能导致install失败的
  event.waitUntil(
    caches.open(_CACHE_INFO.prefetch.name)
      .then(cache => {
        console.info('cache open', _CACHE_INFO.prefetch.name)
        let allCachePromise = _CACHE_INFO.prefetch.uri.map(cacheUri => {
          let reqUrl = new URL(cacheUri, self.location.href)
          // 加时间戳是为了防止缓存的情况
          reqUrl.search += (reqUrl.search ? '&' : '?') + 'cache-bust=' + now;
          // requset stream only use once
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

          })
          return Promise.all(allCachePromise).then(function () {
            console.info('all prefetch file cache completed.')
          })
      })
      .catch(function (error) {
        console.error('predetch cache error', error)
      })
  )
})

// feth事件是对特定的请求有针对性的缓存一般情况下，需要设定缓存级别，缓存一些变动少的资源
// --------------------- fetch flow -----------------------------
// ------- fetch -------> is cache ? ----- yes -----> return cache
// -------------------------- | ---------------------------------
// -------------------------- no --------------------------------
// -------------------------- | ---------------------------------
// ------------------------ request ------ yes-------> cache and return
// -------------------------- | ---------------------------------
// -------------------------- no --------------------------------
// -------------------------- | ---------------------------------
// ------------------------ return ------------------------------
self.addEventListener('fetch', function (event) {
  console.log('Service-worker begin fetch event')
  // 流是单次资源，不能重复使用
  var copyRequest = event.request.clone()
  // 这里可以做需要缓存的资源判断，后期添加
  if (!checkFile(event.request, _CACHE_INFO.duration.uri)) return;
  event.responseWith(
    caches.match(copyRequest)
      .then(function (cacheResponse) {
        // 之前已经缓存了
        if (cacheResponse) {
          console.info('cache url from: ', copyRequest.url)
          return cacheResponse
        }
        // 重新需要fetch请求的
        return fetch(copyRequest)
          .then(function (response) {
            if (!response || !response.ok) {
              return response
            }
            // 请求成功缓存
            var copyResponse = response.clone()
            caches.open(_CACHE_INFO.duration.name)
              .then(function (cache) {
                cache.open(event.request, copyResponse)
              })
            return response
          })
          .catch(function (error) {
            console.error('response error with', error)
            throw error
          })
      })
  )
})

// activate事件是当新的sw(当service-worker.js哪怕有1B的更改，也会导致重新register)替换掉老的sw时触发
// 注意1: 新的sw注册成功后会进入waitting状态，不会马上替换老的sw，只有当老的sw进入terminated状态后，才会由新的sw接管
// 注意2: 新的sw出现但是cache仍旧是旧的文件，所以需要更替版本(所谓的更改一般情况下，应该只是配置部分的处理，而不是self流程上的更改)
// 注意3: 可以把service-worker想象成一个队列，浏览器中只能存在一个SW，所以每个SW的生命周期事件都针对的是自己的config配置和其他的SW配置无关
self.addEventListener('activate', function (event) {
  console.log('Service-worker begin activate event')
  var cacheNames = Object.keys(_CACHE_INFO).map(function (prefix) {
    return _CACHE_INFO[prefix].name
  })
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        // 删除不存在的在cache中不存在的key --> 视为旧的缓存
        var allPromise = keys
          .filter(function (key) { return cacheNames.indexOf(key) === -1 })
          .map(function (key) { return caches.delete(key) })

        return Promise.all(allPromise).then(function () {
          console.info('all old caches file delete completed.')
        })
      })
  )
})

// 类似postMessage用来接收client的信息 --> 可用于client通知SW更新指定缓存
self.addEventListener('message', function (event) {
  event.waitUntil(
    caches.open(_CACHE_INFO.prefetch.name)
      .then(function (cache) {
        let allPromise = []
        if (Array.isArray(event.data)) {
          allPromise = event.data.map(function (data) {
            let url = new URL(data, self.location.href)
            let request = new Request(url)
            return fetch(url)
              .then(function (response) {
                if (response.ok) {
                  return cache.put(url, response)
                }
                throw Error(
                  'fetch response status: ' + response.status + 'statusText' + response.statusText
                )
              })
              .catch(function (error) {
                console.error('Client notify SW fetch error', error)
              })
          })
        }
        return Promise.all(allPromise).then(function () {
          console.info('Client notify SW all update completed.')
        })
      })
      .catch(function (error) {
        console.error('Client notify SW to update cache error', error)
      })
  )
})

//  Sync请求监听，注意：只有到有网时才会自动发送，用于即时性比较高的情况
self.addEventListener('sync', function (event) {
  // if (event.tag) fetch... 
})

