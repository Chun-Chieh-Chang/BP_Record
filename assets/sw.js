const CACHE_NAME = 'bp-nexus-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/assets/chart.js',
  '/assets/chartjs-plugin-annotation.js',
  '/assets/favicon.svg',
  '/assets/manifest.json'
];

// 安裝階段：逐個快取，失敗時忽略不中斷
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          fetch(url).then(response => {
            if (!response.ok) console.warn('SW: cache miss for', url);
            return cache.put(url, response);
          }).catch(() => console.warn('SW: failed to cache', url))
        )
      );
    })
  );
});

// 激活階段：清理舊快取並立即取得控制權
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // 1. 略過 API 請求，直接走網路
  if (event.request.url.includes('/api/')) {
    return;
  }

  // 2. 針對頁面與清單採用「網路優先，失敗才用快取」策略
  // 這能確保您看到的版面永遠是最新的
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 如果抓到正常的資料，存入快取並回傳
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 網路斷線或失敗時，回退到快取
        return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            // 如果連快取都沒有，回傳一個友善的回應
            if (event.request.url.endsWith('.ico')) return new Response(null, { status: 404 });
            return new Response("離線中，且無此頁面紀錄", { status: 503 });
        });
      })
  );
});
