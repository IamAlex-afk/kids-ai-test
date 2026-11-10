// Privacy page (tools/gen-privacy.mjs): pages match the generator; every language has
// the same structure; the page states the GitHub Pages IP logging and links the source;
// no scripts on the page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), 'utf8').replace(/\r\n/g, '\n');
const { renderAll, PRIVACY_LANGS } = await import(new URL('tools/gen-privacy.mjs', root));
const { P, GITHUB_PAGES_DOC } = await import(new URL('tools/privacy/texts.mjs', root));

test('privacy: pages match tools/gen-privacy.mjs', () => {
  for (const [rel, body] of renderAll()) assert.equal(read(rel), body, `${rel} is out of date: run node tools/gen-privacy.mjs`);
});

test('privacy: same structure in every language as RU', () => {
  const shape = (t) => Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Array.isArray(v) ? v.length : typeof v]));
  for (const l of PRIVACY_LANGS) assert.deepEqual(shape(P[l]), shape(P.ru), l);
});

test('privacy: no scripts except JSON-LD; GitHub source linked; listed in sitemap', () => {
  const sm = read('sitemap.xml');
  for (const l of PRIVACY_LANGS) {
    const h = read(`privacy/${l}/index.html`);
    assert.doesNotMatch(h.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ''), /<script/i, l);
    assert.ok(h.includes(GITHUB_PAGES_DOC), `${l}: GitHub Docs link`);
    assert.ok(sm.includes(`/privacy/${l}/</loc>`), `${l}: sitemap`);
  }
});
