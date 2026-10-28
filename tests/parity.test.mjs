// The 10 languages must match each other in structure: the same ages, the
// same number of lessons, mini-tests and quiz questions per age, the same
// question kinds, and the same parents' Q&A layout. Wording, examples,
// icons and sources may be adapted per country — those are not compared.
// English is the structural reference; Russian is the reference for meaning
// (docs/CONTENT-REVIEW.md), which a test cannot check.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
// Objects from another vm context have their own prototypes: compare as JSON.
const load = (file, pick) => { const ctx = { window: {} }; vm.runInNewContext(read(file), ctx); return JSON.parse(JSON.stringify(pick(ctx.window))); };
const data = Object.fromEntries(LANGS.map((l) => [l, load(`data/${l}.js`, (w) => w.LANG_DATA)]));
const faq = Object.fromEntries(LANGS.map((l) => [l, load(`js/parents-faq/${l}.js`, (w) => w.PARENTS_FAQ[l])]));

// Keys, array lengths and value kinds, recursively — no text.
const shape = (v) => Array.isArray(v) ? v.map(shape) : v && typeof v === 'object'
  ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])])) : v === null ? 'null' : typeof v;
const quizKinds = (q) => q.map((x) => x.type || 'choice').sort().join(',');

test('data: same ages and same sections per age in every language', () => {
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(data[l].ages), Object.keys(data.en.ages), `data/${l}.js ages`);
    for (const age of Object.keys(data.en.ages))
      assert.deepEqual(Object.keys(data[l].ages[age]).sort(), Object.keys(data.en.ages[age]).sort(), `data/${l}.js ${age}`);
  }
});

test('data: same lessons, mini-tests and quiz per age in every language', () => {
  for (const l of LANGS) for (const [age, en] of Object.entries(data.en.ages)) {
    const a = data[l].ages[age];
    const at = `data/${l}.js ${age}`;
    assert.equal(a.lessons.length, en.lessons.length, `${at}: lessons`);
    assert.deepEqual(a.lessons.map((x) => (x.miniTest || []).length), en.lessons.map((x) => (x.miniTest || []).length), `${at}: mini-tests per lesson`);
    assert.equal(a.quiz.length, en.quiz.length, `${at}: quiz questions`);
    assert.equal(quizKinds(a.quiz), quizKinds(en.quiz), `${at}: quiz question kinds`);
    for (const [i, q] of a.quiz.entries()) if (Array.isArray(q.options)) {
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, `${at}: quiz ${i} correct index in range`);
    }
    for (const [i, x] of a.lessons.entries()) for (const [j, q] of (x.miniTest || []).entries()) if (Array.isArray(q.options)) {
      assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, `${at}: lesson ${i} test ${j} correct index in range`);
    }
  }
});

test('data: every lesson and question has text in every language', () => {
  const blank = (s) => typeof s !== 'string' || !s.trim();
  for (const l of LANGS) for (const [age, a] of Object.entries(data[l].ages)) {
    for (const [i, x] of a.lessons.entries()) {
      assert.ok(!blank(x.title) && !blank(x.text), `data/${l}.js ${age} lesson ${i}: title and text`);
      for (const q of x.miniTest || []) assert.ok(!blank(q.q) && (q.options || []).every((o) => !blank(o)), `data/${l}.js ${age} lesson ${i}: test text`);
    }
    for (const [i, q] of a.quiz.entries()) assert.ok(!blank(q.q) && (q.options || []).every((o) => !blank(o)), `data/${l}.js ${age} quiz ${i}: text`);
  }
});

test('parents\' Q&A: same layout in every language', () => {
  for (const l of LANGS) assert.deepEqual(shape(faq[l]), shape(faq.en), `js/parents-faq/${l}.js`);
});
