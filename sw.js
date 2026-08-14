/* Kids AI Test — Service Worker v2026.1 — offline + PWA support */
const CACHE = 'kat-2026-08f';
const PRECACHE = [
  './', './index.html', './ru.html', './de.html', './es.html',
  './fr.html', './hi.html', './id.html', './pt.html', './tr.html', './vi.html',
  './css/main.css',
  './js/core.js', './js/card.js', './js/snake.js', './js/platformer.js', './js/racing.js', './js/leaderboard.js', './js/companion.js', './js/glossary.js', './js/names.js', './js/parents-faq.js',
  './data/en.js', './data/ru.js', './data/de.js', './data/es.js',
  './data/fr.js', './data/hi.js', './data/id.js', './data/pt.js',
  './data/tr.js', './data/vi.js',
  './og.png', './manifest.json',
  './icon-192.png', './apple-touch-icon.png', './favicon.ico', './favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  // Stale-while-revalidate: serve the cached copy immediately (fast, works
  // offline), but always also fetch a fresh copy in the background and
  // update the cache for next time — so updates land on the next reload
  // without needing to remember to bump CACHE on every deploy.
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || network;
    })
  );
});
