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
  for (const s of SERIES) assert.deepEqual(s.langs, SERIES_LANGS, `${s.id}: every lesson in every series language`);
  for (const l of SERIES_LANGS) assert.ok(UNKNOWN[l] && MADE_UP[l], `${l}: test markers below`);
});

// Per-language words the checks below look for: the "cannot be decided"
// answer in B, and the "made-up data" note in C.
const UNKNOWN = { ru: /нельзя установить|не знаем/i, en: /cannot be decided|Not yet/i, vi: /chưa thể xác định|chưa biết/i,
  id: /belum bisa dipastikan|belum tahu/i, pt: /ainda não dá para saber|ainda não/i,
  es: /todavía no se puede saber|todavía no/i };
const MADE_UP = { ru: /вымышлен/i, en: /made-up/i, vi: /hư cấu/i, id: /rekaan/i, pt: /fictíci/i, es: /inventad/i };

// Scenario lessons: every question has a valid answer and explanations;
// "cannot be decided" exists in B; C's breakdown explains every piece and
// keeps the task; the new example differs from the worked one.
const scenarioSteps = (s, l, age) => s.text[l][age].steps || [];
test('lesson B: scripted, checkable on the page, "cannot be decided" allowed', () => {
  const s = SERIES.find((x) => x.id === 'check');
  assert.equal(s.sample, true, 'marked as a teaching example');
  for (const l of s.langs) for (const age of ['tiny', 'child', 'teen', 'adult']) {
    const steps = scenarioSteps(s, l, age);
    assert.ok(steps.length >= 3, `${l}/${age}: steps`);
    for (const st of steps) for (const q of st.questions || []) {
      assert.ok(q.correct >= 0 && q.correct < q.options.length, `${l}/${age}: ${q.q}`);
      assert.ok(q.ok && (q.noAll || q.no), `${l}/${age}: explanations for ${q.q}`);
      for (let k = 0; k < q.options.length; k++) if (k !== q.correct) assert.ok((q.no && q.no[k]) || q.noAll, `${l}/${age}: wrong option ${k} explained`);
    }
    const all = steps.flatMap((st) => st.questions || []);
    assert.ok(all.some((q) => UNKNOWN[l].test(q.options[q.correct])), `${l}/${age}: an "unknown" answer is the right one somewhere`);
    if (age === 'teen' || age === 'adult') assert.ok(steps.some((st) => st.sources && st.sources.length === 2), `${l}/${age}: two sources compared`);
  }
});

test('lesson C: demo data only, every piece explained, the task is always kept', () => {
  const s = SERIES.find((x) => x.id === 'share');
  for (const l of s.langs) for (const age of ['tiny', 'child', 'teen', 'adult']) {
    const steps = scenarioSteps(s, l, age);
    const reds = steps.filter((st) => st.redact).map((st) => st.redact);
    assert.ok(reds.length >= 1, `${l}/${age}: has a redaction task`);
    for (const r of reds) {
      assert.ok(r.pieces.some((p) => p.needed), `${l}/${age}: something must be kept`);
      assert.ok(r.pieces.some((p) => !p.needed), `${l}/${age}: something must be removed`);
      for (const p of r.pieces) assert.ok(p.why && p.why.length > 10, `${l}/${age}: "${p.text}" explained`);
    }
    // the new example is a different request from the worked one
    if (reds.length >= 2) assert.notDeepEqual(reds[0].pieces.map((p) => p.text), reds[reds.length - 1].pieces.map((p) => p.text), `${l}/${age}: new example differs`);
    for (const st of steps) if (st.intro || st.bubble) assert.ok(MADE_UP[l].test(JSON.stringify(steps)), `${l}/${age}: says the data is made up`);
  }
  // no real-looking phone numbers: demo numbers are all zeros
  const txt = JSON.stringify(s.text);
  for (const m of txt.matchAll(/\d{3}-\d{2,3}-\d{2,4}/g)) assert.match(m[0], /^[0-]+$/, `demo phone ${m[0]}`);
});

test('route after the age: one "Start" per age, real targets, the older route stays reachable', () => {
  const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
  const page = (l) => (l === 'en' ? 'index.html' : `${l}.html`);
  for (const l of LANGS) {
    const html = read(page(l));
    const route = html.slice(html.indexOf('id="wk-route"'), html.indexOf('</section>', html.indexOf('id="wk-route"')));
    assert.ok(route.length > 0, `${page(l)}: route screen`);
    for (const age of ['tiny', 'child', 'teen', 'adult']) assert.ok(route.includes(`data-route-for="${age}"`), `${page(l)}: ${age}`);
    const starts = [...route.matchAll(/class="wk-start-go" href="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(starts.length, 4, `${page(l)}: exactly one Start per age`);
    for (const href of starts) {
      if (SERIES_LANGS.includes(l)) assert.match(href, new RegExp(`^workshop/${l}/sorter\\.html\\?age=(5-7|8-10|11-13|14-plus)$`), `${page(l)}: ${href}`);
      else assert.match(href, new RegExp(`^lessons/${l}/(5-7|8-10|11-13|14-plus)-1\\.html$`), `${page(l)}: ${href}`);
      assert.ok(fs.existsSync(new URL(href.split('?')[0], root)), `${page(l)}: ${href} exists`);
    }
    assert.match(route, /data-wk-old/, `${page(l)}: lessons with quiz, card and games still reachable`);
  }
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
    assert.deepEqual(hl.map((m) => m[1]).sort(), [...SERIES_LANGS, 'x-default'].sort(), `${rel}: hreflang only between existing pages`);
    for (const [, , href] of hl) assert.ok(href.startsWith(SITE + 'workshop/'), `${rel}: no alternate pointing to the home page`);
    if (!rel.endsWith('index.html')) {
      const data = JSON.parse(html.match(/<script type="application\/json" id="wk-data">([\s\S]*?)<\/script>/)[1]);
      assert.ok(data.kind && data.text.common.title, `${rel}: data`);
      assert.match(html, /<noscript>/, `${rel}: says JS is needed for the activity`);
      for (const k of ['wk-goalbox', 'wk-adult', 'wk-print', 'wk-sources', 'wk-explain-all']) assert.ok(html.includes(k), `${rel}: ${k} without JS`);
    }
  }
  for (const f of ['js/workshop.js', 'js/workshop-sorter.js', 'js/sorter-model.js', 'js/workshop-scenario.js']) {
    assert.doesNotMatch(read(f), /fetch\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|speechSynthesis/, `${f}: sends and stores nothing`);
    assert.doesNotMatch(read(f), /\.innerHTML\s*=/, `${f}: text via textContent only`);
  }
});
