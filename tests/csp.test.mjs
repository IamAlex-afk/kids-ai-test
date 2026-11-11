// CSP hardening: pages that have no inline scripts must not allow them.
// Lessons, articles, privacy, workshop: script-src 'self' (+ the hash of the one workshop line).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const csp = (rel) => (fs.readFileSync(new URL(rel, root), 'utf8').match(/Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
const scriptSrc = (c) => (c.match(/script-src([^;]*)/) || [])[1] || '';

test('csp: lessons, articles, privacy and workshop pages forbid inline scripts', () => {
  const dirs = LANGS.flatMap((l) => [`lessons/${l}/`, `articles/${l}/`, `privacy/${l}/`, `workshop/${l}/`]);
  let n = 0;
  for (const d of dirs) {
    for (const f of fs.readdirSync(new URL(d, root)).filter((x) => x.endsWith('.html'))) {
      const s = scriptSrc(csp(d + f));
      assert.ok(s, `${d}${f}: has a CSP with script-src`);
      assert.doesNotMatch(s, /unsafe-inline|unsafe-eval/, `${d}${f}: ${s}`);
      n++;
    }
  }
  assert.ok(n >= 390, `checked ${n} pages`);
});

test('csp: home pages forbid inline scripts and inline event handlers', () => {
  for (const l of LANGS) {
    const f = l === 'en' ? 'index.html' : `${l}.html`;
    const h = fs.readFileSync(new URL(f, root), 'utf8');
    assert.doesNotMatch(scriptSrc(csp(f)), /unsafe-inline|unsafe-eval/, f);
    assert.doesNotMatch(h, /\son[a-z]+\s*=/i, `${f}: inline event handler`);
    const inline = [...h.matchAll(/<script\b([^>]*)>/gi)].filter((m) => !/\bsrc\s*=/i.test(m[1]) && !/json/i.test(m[1]));
    assert.equal(inline.length, 0, `${f}: inline <script>`);
  }
});
