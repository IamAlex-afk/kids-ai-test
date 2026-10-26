// Checks of the PUBLISHED site over real HTTP. Skipped unless LIVE_URL is set:
//   LIVE_URL=https://iamalex-afk.github.io/kids-ai-test/ node --test tests/live.test.mjs
// In CI it runs after the Pages deploy (.github/workflows/pages.yml) and, with
// EXPECT_COMMIT, first waits until the new version is actually being served.
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.LIVE_URL;
const EXPECT = process.env.EXPECT_COMMIT;
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const page = (l) => (l === 'en' ? '' : `${l}.html`);
const opts = { skip: !BASE && 'LIVE_URL not set' };
const get = (p) => fetch(new URL(p, BASE), { redirect: 'manual', cache: 'no-store' });

test('live: the expected version is served', opts, async () => {
  if (!EXPECT) return;
  let seen;
  for (let i = 0; i < 30; i++) {          // Pages CDN can lag a little after deploy
    const r = await get('version.json?t=' + Date.now());
    if (r.ok) { seen = (await r.json()).commit; if (seen === EXPECT) return; }
    await new Promise((res) => setTimeout(res, 10000));
  }
  assert.equal(seen, EXPECT, 'version.json commit');
});

test('live: every language page is 200, indexable, canonical, in its language', opts, async () => {
  for (const l of LANGS) {
    const url = new URL(page(l), BASE).href;
    const r = await get(page(l));
    assert.equal(r.status, 200, url);
    assert.match(r.headers.get('content-type') || '', /text\/html/, url);
    assert.doesNotMatch(r.headers.get('x-robots-tag') || '', /noindex/i, url);
    const html = await r.text();
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, url);
    assert.equal(html.match(/rel="canonical" href="([^"]+)"/)?.[1], url, `${url}: canonical`);
    assert.match(html, new RegExp(`<html lang="${l === 'pt' ? 'pt-BR' : l}"`), `${url}: lang`);
    assert.match(html, /<h1 class="wk-title"/, `${url}: entry screen markup`);
  }
});

test('live: a missing address is a real 404, not the home page', opts, async () => {
  const r = await get('no-such-page-' + Date.now() + '.html');
  assert.equal(r.status, 404);
  assert.match(await r.text(), /<meta name="robots" content="noindex">/);
});

test('live: page resources, sitemap and robots load', opts, async () => {
  for (const p of ['css/main.css', 'css/workshop.css', 'css/entry.css', 'js/entry.js', 'js/core.js',
    'data/ru.js', 'assets/workshop/hero.webp', 'assets/workshop/hero-small.webp', 'sw.js', 'manifest.json',
    'sitemap.xml', 'robots.txt']) {
    const r = await get(p);
    assert.equal(r.status, 200, p);
  }
  const sm = await (await get('sitemap.xml')).text();
  for (const l of LANGS) assert.ok(sm.includes(`<loc>${new URL(page(l), BASE).href}</loc>`), `sitemap: ${l}`);
});

test('live: lesson catalogs and lesson pages open directly, indexable and canonical', opts, async () => {
  const sm = await (await get('sitemap.xml')).text();
  for (const l of LANGS) {
    for (const p of [`lessons/${l}/`, `lessons/${l}/8-10-1.html`, `lessons/${l}/14-plus-9.html`]) {
      const url = new URL(p, BASE).href;
      const r = await get(p);
      assert.equal(r.status, 200, url);
      const html = await r.text();
      assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, url);
      assert.equal(html.match(/rel="canonical" href="([^"]+)"/)?.[1], url, `${url}: canonical`);
      assert.match(html, new RegExp(`<html lang="${l === 'pt' ? 'pt-BR' : l}"`), `${url}: lang`);
      assert.ok(sm.includes(`<loc>${url}</loc>`), `sitemap: ${url}`);
    }
  }
  for (const p of ['css/lesson.css', 'js/lesson.js']) assert.equal((await get(p)).status, 200, p);
  assert.equal((await get('lessons/ru/8-10-99.html')).status, 404, 'a lesson that does not exist is a 404');
});
