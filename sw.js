/* ---------- SERVICE WORKER ---------- */
// Stale-while-revalidate для статичних ресурсів. Network-first для XBEL-закладок.

const CACHE_NAME = 'tab-links-v1';

const PRECACHE = [
  './',
  'index.html',
  'main.js',
  'app.js',
  'bookmarks.js',
  'tasks.js',
  'styles.css',
  'data/favicon.png',
  'data/favicons/default.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE).catch(() => {})
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Тільки same-origin (фавіконки/Gist API не кешуємо тут — їх кешує браузер).
  if (url.origin !== self.location.origin) return;

  // XBEL закладки: network-first, з fallback на кеш у разі офлайну.
  if (url.pathname.includes('/bookmarks/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Решта (HTML/JS/CSS/PNG/ICO): stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
