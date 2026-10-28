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
const meta = pages.map((f) => {
  const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
  return { f, h, title: dec((h.match(/<title>([^<]*)<\/title>/) || [])[1] || ''), desc: dec((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '') };
});

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
