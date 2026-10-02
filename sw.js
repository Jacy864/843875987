/* RP Shell service worker — 離線快取外殼，API 請求不攔 */
const VER = 'rpf-v5.7';
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;               // API（POST 串流）不碰
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;            // 跨域（bigmodel 等）不碰
  if (e.request.mode === 'navigate') {                   // 頁面本體：網路優先，斷網用快取
    e.respondWith(
      fetch(e.request).then(r => {
        const cp = r.clone();
        caches.open(VER).then(c => c.put('./', cp));
        return r;
      }).catch(() => caches.match('./'))
    );
    return;
  }
  e.respondWith(                                          // 圖標等靜態檔：快取優先
    caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(VER).then(c => c.put(e.request, cp));
      return r;
    }))
  );
});
