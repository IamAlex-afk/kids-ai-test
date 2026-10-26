/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · island/logic.js
   Level state machine shared by the 3D and the text version. No graphics,
   no DOM — testable in Node. Answers come only from island/model.js.

   stages: arrive → collect → gate → (explore2 → retest)* → cross → check
           → finale → done        (5–7: no check stage)
═══════════════════════════════════════════════════════════════════ */

import { LEVEL, AGES, predict, evaluate, trainingAccuracy, trainingSet } from './model.js';

export function createGame(age) {
  const A = AGES[age] || AGES.child;
  return { age, A, stage: 'arrive', examples: [], firstSet: null, gateTries: 0, guess: null,
    garden2Open: false, bridgeOpen: false, done: false };
}

export function countKinds(g) {
  const w = g.examples.filter((p) => p.label === 'water').length;
  return { water: w, desert: g.examples.length - w, total: g.examples.length };
}

export function enough(g) {
  const c = countKinds(g), n = g.A.need;
  return c.water >= n.water && c.desert >= n.desert && c.total >= n.total;
}

export function isGarden2(g, id) { return g.A.garden2.some((p) => p.id === id); }

// Add or take back an example. Garden-2 plants only after it opened.
export function toggleExample(g, p) {
  if (isGarden2(g, p.id) && !g.garden2Open) return 'locked';
  const i = g.examples.findIndex((e) => e.id === p.id);
  if (i >= 0) { g.examples.splice(i, 1); return 'removed'; }
  g.examples.push(p);
  trainingSet(g.examples, g.A.check);              // throws if a check plant slipped in
  if (g.stage === 'arrive' || g.stage === 'collect') g.stage = enough(g) ? 'gate' : 'collect';
  else if (g.stage === 'explore2') g.stage = 'retest';
  return 'added';
}

export function testGate(g) {
  if (!enough(g)) return { blocked: true };
  const r = predict(g.examples, LEVEL.gate);
  g.gateTries++;
  if (!g.firstSet) g.firstSet = g.examples.slice();
  const right = r.label === LEVEL.gate.label;
  if (right) { g.bridgeOpen = true; g.stage = g.A.check.length ? 'cross' : 'finale'; }
  else { g.garden2Open = true; g.stage = 'explore2'; }
  return { r, right, retry: g.gateTries > 1 };
}

export function runCheck(g) {
  const res = evaluate(g.examples, g.A.check);
  if (res.right === res.total) g.stage = 'finale';
  else if (g.stage === 'cross') g.stage = 'check';
  const out = { res };
  if (g.A.compare && g.firstSet) out.before = evaluate(g.firstSet, g.A.check);
  if (g.A.memorise) out.memo = trainingAccuracy(g.examples);
  return out;
}

export function finish(g) {
  if (g.stage !== 'finale') return false;
  g.done = true; g.stage = 'done';
  return true;
}
