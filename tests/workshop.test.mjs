// Workshop series: the sorter model really depends on the data, check cards
// never train it, the registry is complete and honest, generated pages are
// up to date, private and correctly linked.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const require = createRequire(import.meta.url);
const M = require('../js/sorter-model.js');
const { sorter } = await import(new URL('tools/series/sorter.mjs', root));
const { SERIES, SERIES_LANGS, validate } = await import(new URL('tools/series.mjs', root));

const AGES = sorter.data.ages, CATS = sorter.data.categories;
const byId = (list, id) => list.find((c) => c.id === id);

test('sorter: starting data → tie → background rule → wrong on a circle on yellow', () => {
  for (const [age, A] of Object.entries(AGES)) {
    const m = M.train(A.start, CATS.main);
    assert.deepEqual(m.errors, { bg: 0, shape: 0 }, age);
    assert.equal(m.tie, true, age);
    assert.equal(m.feature, 'bg', `${age}: tie goes to background (stated demo rule)`);
    assert.equal(M.predict(m, A.probe), 'square', `${age}: the mistake is real`);
    assert.notEqual(M.predict(m, A.probe), A.probe.label);
  }
});

test('sorter: cards that break the pattern switch the rule to shape; repeats do not', () => {
  for (const [age, A] of Object.entries(AGES)) {
    for (const x of A.extras) {
      const m = M.train(M.trainingSet(A.start, [x], A.test), CATS.main);
      const breaks = x.shape === 'circle' ? x.bg !== 'blue' : x.bg !== 'yellow';
      assert.equal(m.feature, breaks ? 'shape' : 'bg', `${age} + ${x.id}`);
      if (breaks) assert.ok(m.errors.bg > 0 && m.errors.shape === 0, `${age} + ${x.id}: errors before/after`);
    }
  }
  // only repeats (more of the same) — still background
  const A = AGES.child;
  const same = [byId(A.extras, 'x3'), byId(A.extras, 'x4')];
  assert.equal(M.train(M.trainingSet(A.start, same, A.test), CATS.main).feature, 'bg', 'more of the same does not help');
});

test('sorter: same input → same result (no randomness, order-independent tie rule)', () => {
  const A = AGES.child;
  const set = M.trainingSet(A.start, [byId(A.extras, 'x1')], A.test);
  const a = JSON.stringify(M.train(set, CATS.main));
  for (let i = 0; i < 5; i++) assert.equal(JSON.stringify(M.train(set, CATS.main)), a);
  assert.equal(M.train([...set].reverse(), CATS.main).feature, M.train(set, CATS.main).feature);
});

test('sorter: check cards are separate and can never enter training', () => {
  for (const [age, A] of Object.entries(AGES)) {
    const trainIds = new Set([...A.start, ...A.extras, A.probe].map((c) => c.id));
    for (const t of A.test) assert.ok(!trainIds.has(t.id), `${age}: ${t.id} is only for checking`);
    assert.throws(() => M.trainingSet(A.start, [A.test[0]], A.test), /test card used for training/);
  }
  const A = AGES.child;
  const fixed = M.train(M.trainingSet(A.start, [byId(A.extras, 'x1')], A.test), CATS.main);
  const r = M.evaluate(fixed, A.test);
  assert.equal(r.right, r.total, 'after the fix every check card is right');
  const before = M.evaluate(M.train(A.start, CATS.main), A.test);
  assert.ok(before.right < before.total, 'before the fix some check cards are wrong');
});

test('sorter: unseen value → "don\'t know", not a guess', () => {
  const m = M.train(AGES.child.start, CATS.main);
  assert.equal(M.predict(m, { shape: 'circle', bg: 'green' }), null);
});

test('sorter: the new example has other features and is solved only by a pattern-breaking card', () => {
  const N = sorter.data.transfer;
  const m0 = M.train(N.start, CATS.transfer);
  assert.equal(m0.feature, 'bg');
  assert.equal(M.predict(m0, N.probe), 'triangle', 'the learner must predict the mistake, not repeat a shown answer');
  const mainValues = new Set(['circle', 'square', 'blue', 'yellow']);
  for (const c of [...N.start, N.probe, ...N.fixes]) assert.ok(!mainValues.has(c.shape) && !mainValues.has(c.bg), `${c.id}: new features`);
  const fixes = Object.fromEntries(N.fixes.map((c) => [c.id, M.predict(M.train([...N.start, c], CATS.transfer), N.probe) === N.probe.label]));
  assert.deepEqual(fixes, { f1: true, f2: false, f3: false });
});

test('registry: complete for every listed language, no review claims', () => {
  assert.deepEqual(validate(), []);
  for (const s of SERIES) {
    assert.ok(s.sources.length > 0, `${s.id}: sources`);
    for (const x of s.sources) assert.match(x.url, /^https:\/\//, `${s.id}: source url`);
    assert.equal(s.review.native, false); assert.equal(s.review.teacher, false); assert.equal(s.review.children, false);
    for (const l of s.langs) {
      const keysRu = Object.keys(s.text.ru.common).sort(), keysL = Object.keys(s.text[l].common).sort();
      assert.deepEqual(keysL, keysRu, `${s.id}/${l}: same text keys as ru`);
    }
  }
  assert.deepEqual(SERIES_LANGS, ['ru', 'en']);
});

test('workshop pages: match tools/gen-series.mjs, private, linked only to existing equivalents', async () => {
  const { renderAll } = await import(new URL('tools/gen-series.mjs', root));
  const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
  for (const [rel, html] of renderAll()) {
    assert.equal(read(rel).replace(/\r\n/g, '\n'), html, `${rel} is out of date: run node tools/gen-series.mjs`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel}: one h1`);
    assert.match(html, /connect-src 'self';/, `${rel}: CSP`);
    assert.doesNotMatch(html, /js\/storage\.js|js\/core\.js/, `${rel}: stores nothing`);
    assert.doesNotMatch(html, /\son[a-z]+="/, `${rel}: no inline handlers`);
    const hl = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)];
    assert.deepEqual(hl.map((m) => m[1]).sort(), ['en', 'ru', 'x-default'], `${rel}: hreflang only between existing pages`);
    for (const [, , href] of hl) assert.ok(href.startsWith(SITE + 'workshop/'), `${rel}: no alternate pointing to the home page`);
    if (!rel.endsWith('index.html')) {
      const data = JSON.parse(html.match(/<script type="application\/json" id="wk-data">([\s\S]*?)<\/script>/)[1]);
      assert.ok(data.kind && data.text.common.title, `${rel}: data`);
      assert.match(html, /<noscript>/, `${rel}: says JS is needed for the activity`);
      for (const k of ['wk-goalbox', 'wk-adult', 'wk-print', 'wk-sources', 'wk-explain-all']) assert.ok(html.includes(k), `${rel}: ${k} without JS`);
    }
  }
  for (const f of ['js/workshop.js', 'js/workshop-sorter.js', 'js/sorter-model.js']) {
    assert.doesNotMatch(read(f), /fetch\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|speechSynthesis/, `${f}: sends and stores nothing`);
    assert.doesNotMatch(read(f), /\.innerHTML\s*=/, `${f}: text via textContent only`);
  }
});
