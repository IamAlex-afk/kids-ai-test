/* Kids AI Test — Service Worker — offline + PWA support
   Manages ONLY its own caches. The github.io origin is shared with other
   projects, so nothing outside OWN_PREFIX / LEGACY is ever touched.
   tools/build.mjs rewrites CACHE (content hash) and PRECACHE (every
   published file) in dist/sw.js; the values below are the dev defaults. */
const OWN_PREFIX = 'kids-ai-test-';
const CACHE = OWN_PREFIX + 'dev';
// Cache names used by earlier versions of this site (from git history of sw.js).
const LEGACY = ['kat-2026-07', 'kat-2026-08b', 'kat-2026-08c', 'kat-2026-08d', 'kat-2026-08e', 'kat-2026-08f'];
const PRECACHE = [
  './', './index.html', './ru.html', './de.html', './es.html',
  './fr.html', './hi.html', './id.html', './pt.html', './tr.html', './vi.html',
  './css/main.css', './css/workshop.css', './css/entry.css', './css/lesson.css',
  './js/storage.js', './js/storage-ui.js', './js/entry.js', './js/lesson.js',
  './js/core.js', './js/card.js', './js/snake.js', './js/platformer.js', './js/racing.js', './js/leaderboard.js', './js/companion.js', './js/glossary.js', './js/names.js', './js/parents-faq.js',
  './data/en.js', './data/ru.js', './data/de.js', './data/es.js',
  './data/fr.js', './data/hi.js', './data/id.js', './data/pt.js',
  './data/tr.js', './data/vi.js',
  './assets/workshop/hero.webp', './assets/workshop/hero-small.webp',
  './og.png', './manifest.json',
  './icon-192.png', './apple-touch-icon.png', './favicon.ico', './favicon.svg'
];

const SCOPE = self.registration.scope;
const inScope = (url) => url.startsWith(SCOPE);

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      // Half-downloaded offline set (network dropped): discard it and fail
      // the install, so the previous worker and its complete cache stay in charge.
      .catch(err => caches.delete(CACHE).then(() => { throw err; }))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k !== CACHE && (k.startsWith(OWN_PREFIX) || LEGACY.includes(k)))
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromOwnCache(req) {
  return caches.open(CACHE).then(c => c.match(req, { ignoreSearch: req.mode === 'navigate' }));
}
function store(req, res) {
  if (res && res.status === 200 && res.type === 'basic') {
    const clone = res.clone();
    caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !inScope(req.url)) return;

  // Pages: network first, so a new deploy shows on the next visit;
  // offline → the cached page, else the cached start page.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => store(req, res)).catch(() =>
        fromOwnCache(req)
          .then(hit => hit || fromOwnCache(new Request(SCOPE + 'index.html')))
          .then(hit => hit || Response.error()))
    );
    return;
  }

  // Assets: stale-while-revalidate from this project's cache only.
  e.respondWith(
    fromOwnCache(req).then(cached => {
      const network = fetch(req).then(res => store(req, res)).catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
