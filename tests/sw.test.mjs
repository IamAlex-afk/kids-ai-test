// sw.js in a sandbox: only own caches are deleted on update, a failed
// (half-downloaded) install is discarded, responses come only from own cache.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const SRC = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const SCOPE = 'https://iamalex-afk.github.io/kids-ai-test/';

function makeWorker({ failUrl } = {}) {
  const stores = new Map();           // cacheName -> Map(url -> response)
  const open = (name) => {
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
  vm.runInNewContext(SRC, { self, caches, Request, Response: { error: () => ({ error: true }) }, fetch: async () => { throw new Error('offline'); }, URL });
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

test('offline navigation falls back to the cached start page from own cache', async () => {
  const w = makeWorker();
  await w.run('install');
  const res = await w.run('fetch', { request: { method: 'GET', mode: 'navigate', url: SCOPE + 'nope.html' } });
  assert.equal(res.url, './index.html');
});

test('requests outside the project scope are not handled', async () => {
  const w = makeWorker();
  // fetch handler returns early → respondWith never called
  const res = await w.run('fetch', { request: { method: 'GET', mode: 'cors', url: 'https://iamalex-afk.github.io/ai-lab/app.js' } });
  assert.equal(res, undefined);
});
