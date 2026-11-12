// Search snippets of every indexable page (home, lessons, Workshop, articles):
// a title that fits 60 characters — or, when the topic alone is longer, the
// bare topic without the site suffix; a description of 70–160 characters;
// structured data that parses; titles and descriptions not repeated.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const ROOT = new URL('.', root).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const dec = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const len = (s) => [...s].length;
const pages = [
  ...LANGS.map((l) => (l === 'en' ? 'index.html' : `${l}.html`)),
  ...['lessons', 'workshop', 'articles'].flatMap((d) => fs.readdirSync(path.join(ROOT, d))
    .filter((l) => fs.statSync(path.join(ROOT, d, l)).isDirectory())
    .flatMap((l) => fs.readdirSync(path.join(ROOT, d, l)).filter((n) => n.endsWith('.html')).map((n) => `${d}/${l}/${n}`))),
];
// Old one-lesson addresses are now instant meta-refresh redirects (not indexable pages) — checked in static.test.
const meta = pages.map((f) => {
  const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  return { f, h, title: dec((h.match(/<title>([^<]*)<\/title>/) || [])[1] || ''), desc: dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '') };
}).filter((p) => !/http-equiv="refresh"/.test(p.h));

test('seo: title fits 60 characters, or is the bare topic when the topic is longer', () => {
  for (const { f, title } of meta) {
    assert.ok(title, `${f}: title`);
    if (len(title) > 60) assert.doesNotMatch(title, /\| Kids AI Test$/, `${f}: ${len(title)} characters with the site suffix`);
  }
});

test('seo: description is 70–160 characters', () => {
  for (const { f, desc } of meta) assert.ok(len(desc) >= 70 && len(desc) <= 160, `${f}: description ${len(desc)}`);
});

test('seo: structured data on every page parses', () => {
  for (const { f, h } of meta) {
    const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.ok(blocks.length > 0, `${f}: JSON-LD`);
    for (const [, j] of blocks) assert.doesNotThrow(() => JSON.parse(j), `${f}: JSON-LD parses`);
  }
});

test('seo: no two pages share a title or a description', () => {
  for (const k of ['title', 'desc']) {
    const seen = new Map();
    for (const m of meta) { assert.ok(!seen.has(m[k]), `${k} of ${m.f} repeats ${seen.get(m[k])}`); seen.set(m[k], m.f); }
  }
});

// Google, "Tell Google about localized versions of your page" (read 2026-11-08):
// "Each language version must list itself as well as all other language
// versions" and "If two pages don't both point to each other, the tags will be
// ignored." Plus an x-default on every page, and every alternate exists.
test('seo: hreflang lists itself and x-default, and every pair points both ways', () => {
  const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
  const toFile = (u) => { let p = u.slice(SITE.length).split(/[?#]/)[0]; if (p === '' || p.endsWith('/')) p += 'index.html'; return p; };
  const info = new Map(meta.map(({ f, h }) => [f, {
    can: (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1],
    alts: [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
  }]));
  for (const [f, { can, alts }] of info) {
    assert.ok(can, `${f}: canonical`);
    assert.ok(alts.some(([, u]) => u === can), `${f}: hreflang lists itself`);
    assert.ok(alts.some(([c]) => c === 'x-default'), `${f}: x-default`);
    for (const [c, u] of alts) {
      if (c === 'x-default' || !u.startsWith(SITE)) continue;
      const g = toFile(u);
      assert.ok(info.has(g), `${f}: ${c} alternate ${g} exists`);
      if (g !== f) assert.ok(info.get(g).alts.some(([, v]) => v === can), `${g} points back to ${f}`);
    }
  }
});
