// CSP hardening: pages that have no inline scripts must not allow them.
// Lessons, articles, privacy: script-src 'self' only. Grows as other page types are cleaned up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const csp = (rel) => (fs.readFileSync(new URL(rel, root), 'utf8').match(/Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
const scriptSrc = (c) => (c.match(/script-src([^;]*)/) || [])[1] || '';

test('csp: lessons, articles and privacy pages forbid inline scripts', () => {
  const dirs = LANGS.flatMap((l) => [`lessons/${l}/`, `articles/${l}/`, `privacy/${l}/`]);
  let n = 0;
  for (const d of dirs) {
    for (const f of fs.readdirSync(new URL(d, root)).filter((x) => x.endsWith('.html'))) {
      const s = scriptSrc(csp(d + f));
      assert.ok(s, `${d}${f}: has a CSP with script-src`);
      assert.doesNotMatch(s, /unsafe-inline|unsafe-eval/, `${d}${f}: ${s}`);
      n++;
    }
  }
  assert.ok(n >= 350, `checked ${n} pages`);
});
