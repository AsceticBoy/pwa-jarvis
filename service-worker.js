// service-worker.js record the liftcycle event focus
'use strict'

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

// send web-push info to client
function sendPushInfo(event) {
  console.info('Begin send Notification')
  // ----- 必须 -----
  // - title -> 标题
  // ----- 非必须 -----
  // - body[String] -> 消息主体
  // - icon[String] -> 消息图标 URL
  // - image[String] -> 在 body 里面附带显示的图片 URL，大小最好是 4:3 的比例
  // - dir[String] -> 消息显示的方向 [auto] or [ltr] or [rtl]
  // - renotify[Boolean] -> 当重复的 Not 触发时(依据tag)，标识是否禁用振动和声音,默认为 false
  // - vibrate[Array] -> 用来设置振动的范围。格式为:[振动,暂停,振动,暂停…]。具体取值单位为 ms。比如：[100,200,100]。振动 100ms，静止 200ms，振动 100ms
  // - tag[String]-> 用来标识每个 Not。方便后续对 Not 进行相关管理。
  // - sound[String] -> 声音位置，MDN上并未标注
  // - data[Any] -> 用来附带在 Not 里面的信息。我们一般可以在 notificationclick 事件中，对回调参数进行调用event.notification.data
  // - silent[Boolean] -> 防止Not发出声音或者震动，默认是false
  // - requireInteraction[Boolean] -> 展示Not一段时间后自己会消失，当然也可以靠这个留很长时间，让用户处理
  // - badge[String]
  // - actions[Array] -> UI上的效果自己试，主要是对notificationclick事件做针对性处理的
  var title = 'It first web-push notification';
  var options = {
    body: 'We have received a push message.',
    icon: '/sw-material/image/jarvis.png',
    image: '/sw-material/image/jarvis.png',
    dir: 'ltr',
    slient: true,
    renotify: true,
    requireInteraction: false,
    vibrate: [100,200,100],
    sound: '/sw-material/audio/notify.mp3',
    tag: 'simple-example',
    badge: '/sw-material/image/jarvis.png',
    actions: [{action: 'focus', title: "focus"}],
    data: {
      doge: {
        wow: 'such amaze notification data'
      }
    }
  }
  return self.registration.showNotification(title, options)
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
// ------------------------- Push Flow ---------------------------
// +-------+           +--------------+       +-------------+
// |  UA   |           | Push Service |       | Application |
// +-------+           +--------------+       |   Server    |
//     |                      |               +-------------+
//     |      Subscribe       |                      |
//     |--------------------->|                      |
//     |       Monitor        |                      |
//     |<====================>|                      |
//     |                      |                      |
//     |          Distribute Push Resource           |
//     |-------------------------------------------->|
//     |                      |                      |
//     :                      :                      :
//     |                      |     Push Message     |
//     |    Push Message      |<---------------------|
//     |<---------------------|                      |
//     |                      |                      |
// ---------------------------------------------------------------
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

// Sync请求监听，注意：只有到有网时才会自动发送，用于即时性比较高的情况
self.addEventListener('sync', function (event) {
  // if (event.tag) fetch... 
})

// Push用于监听服务端的push事件，当收到后SW可以通过Notification推送给用户 ServiceWorkerRegistration.showNotification
self.addEventListener('push', function (event) {
  // event have push info
  event.waitUntil(
    sendPushInfo(event)
  )
})

// notificationclick用于当用户点击notification时触发
// Clients其实是当前浏览器打开窗口等一个集合，但是注意你只能操作和你域名一致的窗口
// Clients.get(id): 用来获得某个具体的 client object
// Clients.matchAll(options): 用来匹配当前 SW 控制的窗口。
// 由于 SW 是根据路径来控制的，有可能只返回一部分，而不是同域。如果需要返回同域的窗口，则需要设置响应的
// ** includeUncontrolled[Boolean]: 是否返回所有同域的 client。默认为 false。只返回当前 SW 控制的窗口
// ** type: 设置返回 client 的类型。通常有：window, worker, sharedworker, 和 all。默认是 all
// Clients.openWindow(url): 用来打开具体某个页面
// Clients.claim(): 用来设置当前 SW 和同域的 cilent 进行关联

// Client每个窗口对象
// Client.type: 窗口类型可选window，worker，sharedworker等
// Client.postMessage(msg[,transfer]): 用来和指定的窗口进行通信
// Client.id[String]: 使用一个唯一的 id 表示当前窗口
// Client.url: 窗口的 url

// 针对type为window的窗口
// WindowClient.focus(): 聚焦到当前SW控制的页面
// WindowClient.navigate(url): 将当前页面到想到指定 url
// WindowClient.focused[boolean]: 表示用户是否停留在当前 client
self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.tag)
  // route you what to open
  var route = self.location.href
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close()
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    // 匹配特定条件的client
    // case1: 没有窗口被打开，需要新打开一个窗口
    // case2: 有窗口已经被打开了，只要聚焦下就行了
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function (arrayToMatchs) {
      var currentClient = null
      for (var i = 0; i < arrayToMatchs.length; i++) {
        var clientUrl = new URL(arrayToMatchs[i].url)
        if (clientUrl.href === route) {
          currentClient = arrayToMatchs[i];
          currentClient.focus()
          return currentClient
        }
      }
      if (!currentClient) {
        clients.openWindow(route)
      }
    })
    .then(function (clientMatched) {
      // 已经有匹配到的client不需要再进行消息接收
      if (!clientMatched) {
        // TODO
      }
    })
  )
})