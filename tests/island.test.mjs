// 3D level "Island of Examples": the teaching model really depends on the
// examples, check plants never train it, and the level's story holds:
// biased examples → wrong at the gate → pattern-breaking examples fix it,
// "more of the same" does not; the final check needs variety.
import test from 'node:test';
import assert from 'node:assert/strict';

const M = await import(new URL('../js/island/model.js', import.meta.url));
const { LEVEL, predict, evaluate, trainingSet, distance } = M;
const byId = (id) => [...LEVEL.garden1, ...LEVEL.garden2].find((p) => p.id === id);

test('features are scaled: distance is symmetric, zero to itself, ≤ √2', () => {
  for (const a of LEVEL.garden1) {
    assert.equal(distance(a, a), 0);
    for (const b of LEVEL.garden2) {
      assert.equal(distance(a, b), distance(b, a));
      assert.ok(distance(a, b) <= Math.SQRT2 + 1e-12);
    }
  }
});

test('biased first garden → the gate plant is classified wrongly, by a real nearest neighbour', () => {
  const r = predict(LEVEL.garden1, LEVEL.gate);
  assert.equal(r.label, 'desert');
  assert.notEqual(r.label, LEVEL.gate.label);
  assert.equal(r.nearest.id, 'g6', 'nearest is the short orange plant');
});

test('a short teal example fixes the gate; "more of the same" does not', () => {
  for (const id of ['h1', 'h2']) assert.equal(predict([...LEVEL.garden1, byId(id)], LEVEL.gate).label, 'water', id);
  for (const id of ['h5', 'h3', 'h4']) assert.equal(predict([...LEVEL.garden1, byId(id)], LEVEL.gate).label, 'desert', id);
});

test('final check needs variety: without a tall orange example c2 is wrong, with it all are right', () => {
  const fixGateOnly = [...LEVEL.garden1, byId('h1')];
  const a = evaluate(fixGateOnly, LEVEL.check);
  assert.equal(a.rows.find((r) => r.plant.id === 'c2').ok, false);
  const varied = [...LEVEL.garden1, byId('h1'), byId('h3')];
  const b = evaluate(varied, LEVEL.check);
  assert.equal(b.right, b.total);
});

test('same examples → same answer; order of equal examples is stable', () => {
  const ex = [...LEVEL.garden1, byId('h2'), byId('h4')];
  const first = JSON.stringify(evaluate(ex, LEVEL.check));
  for (let i = 0; i < 5; i++) assert.equal(JSON.stringify(evaluate(ex, LEVEL.check)), first);
});

test('check plants can never become examples', () => {
  assert.throws(() => trainingSet([...LEVEL.garden1, LEVEL.check[0]], LEVEL.check), /check plant/);
  const ids = new Set([...LEVEL.garden1, ...LEVEL.garden2, LEVEL.gate].map((p) => p.id));
  for (const c of LEVEL.check) assert.ok(!ids.has(c.id));
});

test('every age: the first test at the gate is wrong with garden-1 examples, and garden 2 can fix it', () => {
  const { AGES } = M;
  for (const [age, A] of Object.entries(AGES)) {
    // the minimum the age requires: water and desert examples from garden 1
    const water = A.garden1.filter((p) => p.label === 'water'), desert = A.garden1.filter((p) => p.label === 'desert');
    assert.ok(water.length >= A.need.water && desert.length >= A.need.desert, `${age}: enough examples offered`);
    // any allowed first choice that contains a desert example is wrong at the gate
    for (const d of desert) assert.equal(predict([water[0], d], LEVEL.gate).label, 'desert', `${age}: ${d.id}`);
    // garden 2 offers at least one fixing example
    assert.ok(A.garden2.some((h) => predict([...A.garden1, h], LEVEL.gate).label === 'water'), `${age}: a fix exists`);
    // and at least one "more of the same" example that does not fix it
    assert.ok(A.garden2.some((h) => predict([...A.garden1, h], LEVEL.gate).label === 'desert'), `${age}: a non-fix exists`);
    // every check can be passed with the examples this age is offered
    const best = [...A.garden1, ...A.garden2];
    assert.equal(evaluate(best, A.check).right, A.check.length, `${age}: checks are solvable`);
  }
});

test('14+: memorising the examples gives 100% on them, but not necessarily on new plants', () => {
  const ex = [...LEVEL.garden1];
  assert.equal(M.trainingAccuracy(ex).right, ex.length);
  assert.ok(evaluate(ex, [...LEVEL.check, LEVEL.border]).right < LEVEL.check.length + 1);
});

// ── level flow through the same functions the 3D and text versions use ──
const L = await import(new URL('../js/island/logic.js', import.meta.url));
for (const age of ['tiny', 'child', 'teen', 'adult']) {
  test(`level flow (${age}): collect → wrong at gate → fix → bridge → check → finale`, () => {
    const g = L.createGame(age);
    assert.equal(L.testGate(g).blocked, true, 'no test before enough examples');
    for (const p of g.A.garden1) if (!L.enough(g)) L.toggleExample(g, p);
    assert.equal(g.stage, 'gate');
    const first = L.testGate(g);
    assert.equal(first.right, false, 'first test is wrong');
    assert.equal(g.garden2Open, true);
    assert.equal(g.bridgeOpen, false);
    // garden 2 is locked before the first test in a fresh game
    const g0 = L.createGame(age);
    assert.equal(L.toggleExample(g0, g.A.garden2[0]), 'locked');
    // "more of the same" does not open the bridge
    const same = g.A.garden2.find((h) => h.label === 'water' && h.height > 60);
    if (same) { L.toggleExample(g, same); assert.equal(L.testGate(g).right, false); }
    // a pattern-breaking example does
    L.toggleExample(g, g.A.garden2.find((h) => h.label === 'water' && h.height < 40));
    assert.equal(L.testGate(g).right, true);
    assert.equal(g.bridgeOpen, true);
    if (g.A.check.length) {
      const desertTall = g.A.garden2.find((h) => h.label === 'desert' && h.height > 60);
      const out = L.runCheck(g);
      if (out.res.right < out.res.total) { L.toggleExample(g, desertTall); assert.equal(L.runCheck(g).res.right, g.A.check.length); }
      if (g.A.compare) assert.ok(L.runCheck(g).before, 'compares two sets');
      if (g.A.memorise) assert.equal(L.runCheck(g).memo.right, g.examples.length, 'memorising = 100% on own examples');
    }
    assert.equal(g.stage, 'finale');
    assert.equal(L.finish(g), true);
    assert.equal(g.done, true);
  });
}

// ── texts: 10 languages, same keys, no empty strings ──
const keysOf = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? keysOf(v, p + k + '.') : [p + k]));
test('texts: all 10 languages have exactly the English keys and no empty values', async () => {
  const en = (await import(new URL('../js/island/lang/en.js', import.meta.url))).default;
  const want = keysOf(en).sort();
  for (const l of ['ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi']) {
    const t = (await import(new URL(`../js/island/lang/${l}.js`, import.meta.url))).default;
    assert.deepEqual(keysOf(t).sort(), want, `${l}: same keys as en`);
    const flat = JSON.stringify(t);
    assert.doesNotMatch(flat, /:""/, `${l}: no empty strings`);
    for (const a of ['learned']) assert.equal(t[a].length, en[a].length, `${l}.${a}`);
    for (const age of Object.keys(en.limits)) assert.equal(t.limits[age].length, en.limits[age].length, `${l}.limits.${age}`);
  }
});

// ── privacy / safety of the new code ──
import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');
test('3D level: same strict CSP, no CDN, no network calls, no direct storage, no inline handlers', () => {
  const html = read('island/index.html');
  assert.match(html, /script-src 'self';/, 'no inline scripts allowed');
  assert.match(html, /connect-src 'self';/);
  assert.doesNotMatch(html, /https?:\/\/(?!iamalex)/, 'no external URLs');
  assert.doesNotMatch(html, /\son[a-z]+="/);
  for (const f of ['main', 'ui', 'world', 'robot', 'model', 'logic']) {
    const src = read(`js/island/${f}.js`);
    assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|getUserMedia|innerHTML\s*=/, f);
    assert.doesNotMatch(src, /from\s+['"]https?:/, `${f}: no CDN imports`);
  }
});

test('three.js is vendored unchanged with its licence (hashes match the README)', async () => {
  const { createHash } = await import('node:crypto');
  const readme = read('js/vendor/three/README.md');
  for (const f of ['three.module.min.js', 'three.core.min.js']) {
    const h = createHash('sha256').update(fs.readFileSync(new URL('../js/vendor/three/' + f, import.meta.url))).digest('hex');
    assert.ok(readme.includes(h), `${f}: sha256 ${h} listed in README`);
  }
  assert.match(read('js/vendor/three/LICENSE'), /MIT License/);
});

test('true rule: colour decides, height does not (so the lesson is honest)', () => {
  for (const p of [...LEVEL.garden1, ...LEVEL.garden2, LEVEL.gate, ...LEVEL.check, LEVEL.border])
    assert.equal(p.label, p.hue < 0.5 ? 'water' : 'desert', p.id);
});
