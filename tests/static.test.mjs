// Static checks over the real site files: no unexpected external requests,
// no storage bypass, no unsupported promises, consistent age labels,
// working language URLs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const page = (l) => (l === 'en' ? 'index.html' : `${l}.html`);
const jsFiles = fs.readdirSync(new URL('js/', root)).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
const dataFiles = LANGS.map(l => `data/${l}.js`);

test('CSP allows network requests only to the site itself', () => {
  for (const l of LANGS) {
    const csp = read(page(l)).match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
    assert.match(csp, /connect-src 'self';/, page(l));
    assert.doesNotMatch(csp, /worldtimeapi/, page(l));
  }
});

test('no script requests a third-party URL (fetch / XHR / sendBeacon / WebSocket)', () => {
  for (const f of jsFiles) {
    const src = read(f);
    for (const m of src.matchAll(/(fetch|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(([^)]*)\)/g)) {
      assert.doesNotMatch(m[2], /https?:\/\//, `${f}: ${m[0]}`);
    }
    assert.doesNotMatch(src, /worldtimeapi/, f);
  }
});

test('only js/storage.js touches localStorage/sessionStorage; never clear()', () => {
  for (const f of jsFiles) {
    const src = read(f);
    assert.doesNotMatch(src, /localStorage\.clear|sessionStorage\.clear/, f);
    if (f === 'js/storage.js') continue;
    assert.doesNotMatch(src, /\blocalStorage\b|\bsessionStorage\b/, f);
  }
});

test('storage.js is loaded before every module that stores progress', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    const at = (s) => html.indexOf(`<script src="${s}"></script>`);
    assert.ok(at('js/storage.js') > -1, `${page(l)} loads storage.js`);
    for (const m of ['js/snake.js', 'js/leaderboard.js', 'js/companion.js', 'js/platformer.js', 'js/racing.js', 'js/core.js'])
      assert.ok(at('js/storage.js') < html.indexOf(m), `${page(l)}: storage.js before ${m}`);
  }
});

test('no unsupported promises about the card, trust or comparisons', () => {
  const banned = /Cannot be faked|unforgeable|Trusted by parents|Подделать невозможно|Kann nicht gefälscht|No puede falsificarse|Impossible à falsifier|नकली नहीं बनाया जा सकता|Tidak bisa dipalsukan|Não pode ser falsificad|Taklit edilemez|Không thể làm giả|beat 90%|обошёл 90%|verify\.html|better than most people|больше, чем знает большинство взрослых/;
  for (const f of [...LANGS.map(page), ...jsFiles, ...dataFiles, 'README.md', 'llms.txt', 'ai.txt', 'manifest.json'])
    assert.doesNotMatch(read(f), banned, f);
});

test('age labels use the 5–7 / 8–10 / 11–13 / 14+ scheme', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    const labels = [...html.matchAll(/class="age-label">([^<]+)</g)].map(m => m[1].replace(/\s/g, ''));
    assert.deepEqual(labels, ['5–7', '8–10', '11–13', '14+'], page(l));
    assert.match(html, /"suggestedMinAge": 5/, page(l));
    assert.doesNotMatch(html, /title="[^"]*\b(3–5|6–9|10–13)\b/, page(l));
    assert.doesNotMatch(html, /\b3[–-]17\b|3&#8211;17/, page(l));
  }
  for (const f of dataFiles) {
    const src = read(f);
    assert.doesNotMatch(src, /age_tiny:\s*'3 – 5'|age_child:\s*'6 – 9'|age_teen:\s*'10 – 13'/, f);
  }
});

test('canonical + hreflang: every page lists all 10 languages and x-default', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    const canon = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(canon, 'https://iamalex-afk.github.io/kids-ai-test/' + (l === 'en' ? '' : page(l)));
    const langs = [...html.matchAll(/hreflang="([^"]+)"/g)].map(m => m[1]).sort();
    assert.deepEqual(langs, [...LANGS, 'x-default'].sort(), page(l));
    assert.match(html, new RegExp(`<html lang="${l === 'pt' ? 'pt-BR' : l}"`), page(l));
  }
});

test('sitemap lists every language URL; Google verification file kept', () => {
  const sm = read('sitemap.xml');
  for (const l of LANGS) assert.ok(sm.includes('<loc>https://iamalex-afk.github.io/kids-ai-test/' + (l === 'en' ? '' : page(l)) + '</loc>'), l);
  assert.match(read('googled8a35f2a8c073799.html'), /google-site-verification: googled8a35f2a8c073799\.html/);
});
