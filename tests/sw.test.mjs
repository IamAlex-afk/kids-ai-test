// sw.js in a sandbox: only own caches are deleted on update, a failed
// (half-downloaded) install is discarded, responses come only from own cache.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const SCOPE = 'https://iamalex-afk.github.io/kids-ai-test/';

// online: fetch answers 200; brokenCache: every cache operation rejects.
function makeWorker({ failUrl, online = false, brokenCache = false } = {}) {
  const stores = new Map();           // cacheName -> Map(url -> response)
  const open = (name) => {
    if (brokenCache) return Promise.reject(new Error('cache storage broken'));
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return Promise.resolve({
      addAll: async (urls) => {
        for (const u of urls) {
          if (u === failUrl) throw new Error('network dropped');
          m.set(new URL(u, SCOPE).href, { ok: true, url: u });
        }
      },
      put: async (req, res) => m.set(typeof req === 'string' ? req : req.url, res),
      match: async (req) => m.get(typeof req === 'string' ? req : req.url),
    });
  };
  const caches = {
    open,
    keys: async () => [...stores.keys()],
    delete: async (n) => stores.delete(n),
    match: async () => { throw new Error('global caches.match must not be used'); },
  };
  const listeners = {};
  const self = {
    registration: { scope: SCOPE },
    location: { origin: 'https://iamalex-afk.github.io' },
    addEventListener: (t, fn) => { listeners[t] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  class Request { constructor(url) { this.url = url; this.method = 'GET'; this.mode = 'cors'; } }
  class Response {
    constructor(body, init = {}) { this.body = body; this.status = init.status ?? 200; this.headers = init.headers || {}; this.type = 'basic'; }
    clone() { return this; }
    static error() { return { error: true }; }
  }
  const fetch = async (req) => {
    if (!online) throw new Error('offline');
    const r = new Response('from network'); r.url = req.url; return r;
  };
  vm.runInNewContext(SRC, { self, caches, Request, Response, fetch, URL });
  const run = async (type, extra = {}) => {
    let p; listeners[type]({ ...extra, waitUntil: (x) => { p = x; }, respondWith: (x) => { p = x; } });
    return p;
  };
  return { stores, run };
}

test('activate deletes only this project\'s old caches', async () => {
  const w = makeWorker();
  for (const n of ['kat-2026-08f', 'kat-2026-07', 'kids-ai-test-old', 'ai-lab-v3', 'workbox-precache-v2', 'kat-other-app'])
    w.stores.set(n, new Map());
  await w.run('install');
  await w.run('activate');
  const left = [...w.stores.keys()].sort();
  assert.deepEqual(left, ['ai-lab-v3', 'kat-other-app', 'kids-ai-test-dev', 'workbox-precache-v2']);
});

test('half-downloaded offline set is discarded and install fails', async () => {
  const w = makeWorker({ failUrl: './data/vi.js' });
  w.stores.set('kat-2026-08f', new Map([['x', 1]]));
  await assert.rejects(w.run('install'));
  assert.equal(w.stores.has('kids-ai-test-dev'), false, 'partial cache removed');
  assert.equal(w.stores.has('kat-2026-08f'), true, 'old complete cache still there');
});

test('offline: a page saved earlier opens from own cache', async () => {
  const w = makeWorker();
  await w.run('install');
  const res = await w.run('fetch', { request: { method: 'GET', mode: 'navigate', url: SCOPE + 'ru.html' } });
  assert.equal(res.url, './ru.html');
});

test('offline: an unsaved lesson gets a clear message on its own address, not the start page', async () => {
  const w = makeWorker();
  await w.run('install');
  const res = await w.run('fetch', { request: { method: 'GET', mode: 'navigate', url: SCOPE + 'lessons/ru/8-10-3.html' } });
  assert.equal(res.status, 503);
  assert.match(res.body, /<html lang="ru">/);
  assert.match(res.body, /не сохранена для работы без сети/);
  assert.match(res.body, /href="https:\/\/iamalex-afk\.github\.io\/kids-ai-test\/ru\.html"/);
  assert.notEqual(res.url, './index.html');
});

test('a broken cache never hides a working network answer', async () => {
  const w = makeWorker({ online: true, brokenCache: true });
  const page = await w.run('fetch', { request: { method: 'GET', mode: 'navigate', url: SCOPE + 'lessons/en/' } });
  assert.equal(page.body, 'from network');
  const asset = await w.run('fetch', { request: { method: 'GET', mode: 'cors', url: SCOPE + 'js/lesson.js' } });
  assert.equal(asset.body, 'from network');
});

test('requests outside the project scope are not handled', async () => {
  const w = makeWorker();
  // fetch handler returns early → respondWith never called
  const res = await w.run('fetch', { request: { method: 'GET', mode: 'cors', url: 'https://iamalex-afk.github.io/ai-lab/app.js' } });
  assert.equal(res, undefined);
});
