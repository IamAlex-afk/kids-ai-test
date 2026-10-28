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
  './js/core.js', './js/card.js', './js/snake.js', './js/platformer.js', './js/racing.js', './js/leaderboard.js', './js/companion.js', './js/glossary.js', './js/names.js',
  './js/parents-faq/en.js', './js/parents-faq/ru.js', './js/parents-faq/de.js', './js/parents-faq/es.js', './js/parents-faq/fr.js',
  './js/parents-faq/hi.js', './js/parents-faq/id.js', './js/parents-faq/pt.js', './js/parents-faq/tr.js', './js/parents-faq/vi.js',
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

// A broken or blocked cache must never hide a working network answer:
// cache errors resolve to "not cached".
function fromOwnCache(req) {
  return caches.open(CACHE)
    .then(c => c.match(req, { ignoreSearch: req.mode === 'navigate' }))
    .catch(() => undefined);
}

// Offline and this page was never opened: say so on this address, instead
// of showing the start page under a URL it does not belong to.
const OFFLINE = {
  en: ['You are offline', 'This page has not been opened on this device yet, so it is not saved for offline use. Connect to the internet and open it again.', 'Start page'],
  ru: ['Нет подключения к интернету', 'Эту страницу ещё не открывали на этом устройстве, поэтому она не сохранена для работы без сети. Подключитесь к интернету и откройте её снова.', 'Главная'],
  de: ['Keine Internetverbindung', 'Diese Seite wurde auf diesem Gerät noch nicht geöffnet und ist darum nicht offline gespeichert. Verbinde dich mit dem Internet und öffne sie erneut.', 'Startseite'],
  es: ['Sin conexión', 'Esta página aún no se ha abierto en este dispositivo, así que no está guardada para usarla sin conexión. Conéctate a internet y ábrela de nuevo.', 'Inicio'],
  fr: ['Pas de connexion', 'Cette page n’a pas encore été ouverte sur cet appareil : elle n’est donc pas enregistrée hors ligne. Connecte-toi à internet et ouvre-la à nouveau.', 'Accueil'],
  hi: ['इंटरनेट नहीं है', 'यह पेज इस डिवाइस पर अभी तक नहीं खोला गया, इसलिए बिना इंटरनेट के सहेजा नहीं गया है। इंटरनेट से जुड़ें और इसे फिर से खोलें।', 'मुख्य पेज'],
  id: ['Tidak ada koneksi', 'Halaman ini belum pernah dibuka di perangkat ini, jadi belum tersimpan untuk dipakai tanpa internet. Sambungkan ke internet lalu buka lagi.', 'Halaman utama'],
  pt: ['Sem conexão', 'Esta página ainda não foi aberta neste dispositivo, então não está salva para uso offline. Conecte-se à internet e abra de novo.', 'Página inicial'],
  tr: ['İnternet bağlantısı yok', 'Bu sayfa bu cihazda henüz açılmadı, bu yüzden çevrimdışı kullanım için kaydedilmedi. İnternete bağlanıp yeniden aç.', 'Ana sayfa'],
  vi: ['Không có kết nối', 'Trang này chưa từng được mở trên thiết bị này nên chưa được lưu để dùng ngoại tuyến. Hãy kết nối internet và mở lại.', 'Trang chủ'],
};
function offlinePage(url) {
  const rel = url.slice(SCOPE.length);
  const m = rel.match(/^lessons\/([a-z]{2})\//) || rel.match(/^([a-z]{2})\.html/);
  const lang = m && OFFLINE[m[1]] ? m[1] : 'en';
  const [h, p, home] = OFFLINE[lang];
  const homeHref = SCOPE + (lang === 'en' ? '' : lang + '.html');
  const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${h} · Kids AI Test</title>
<style>body{font:18px/1.6 system-ui,sans-serif;max-width:36rem;margin:12vh auto;padding:0 1.2rem;color:#1d1b33;background:#fbf8f1}
a{color:#4b43b0;font-weight:700}a:focus-visible{outline:3px solid #4b43b0;outline-offset:3px}</style></head>
<body><main><h1>${h}</h1><p>${p}</p><p><a href="${homeHref}">${home}</a></p></main></body></html>`;
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
  // offline → the cached page, else a clear "not saved offline" page
  // on this same address (never another page's content).
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => store(req, res)).catch(() =>
        fromOwnCache(req).then(hit => hit || offlinePage(req.url)))
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
