/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · island/model.js
   The teaching model of the 3D level "Island of Examples".

   A 1-nearest-neighbour classifier on two features that are already
   measured and given as numbers (plant height in cm and leaf colour as a
   hue on a 0–1 teal→orange scale). It does NOT see the 3D picture and it
   is NOT a neural network: it only compares numbers with the examples the
   player gave it, after scaling both features to 0–1 so that neither
   dominates just because of its units.

   Pure functions, no randomness: the same examples give the same answer.
   Check plants are kept apart from training examples.
═══════════════════════════════════════════════════════════════════ */

// Feature ranges used for scaling (min–max normalisation).
export const RANGES = { height: [10, 90], hue: [0, 1] };

export function normalise(p) {
  const n = (v, [lo, hi]) => (v - lo) / (hi - lo);
  return { h: n(p.height, RANGES.height), c: n(p.hue, RANGES.hue) };
}

export function distance(a, b) {
  const x = normalise(a), y = normalise(b);
  return Math.hypot(x.h - y.h, x.c - y.c);
}

// → { label, nearest, dist } or null when there are no examples yet.
// Ties go to the example added first (stable, explained to adults).
export function predict(examples, plant) {
  let best = null;
  for (const ex of examples) {
    const d = distance(ex, plant);
    if (!best || d < best.dist - 1e-9) best = { label: ex.label, nearest: ex, dist: d };
  }
  return best;
}

// Training examples must never include a check plant.
export function trainingSet(examples, checkPlants) {
  const ids = new Set(checkPlants.map((p) => p.id));
  for (const e of examples) if (ids.has(e.id)) throw new Error('check plant used as an example: ' + e.id);
  return examples;
}

export function evaluate(examples, checkPlants) {
  const rows = checkPlants.map((p) => {
    const r = predict(examples, p);
    return { plant: p, guess: r && r.label, ok: !!r && r.label === p.label, nearest: r && r.nearest };
  });
  return { rows, right: rows.filter((r) => r.ok).length, total: rows.length };
}

/* ── Level data ──
   True rule (unknown to the model): the leaf colour decides — teal leaves
   are water plants, orange leaves are desert plants. Height does not matter.
   The first garden is biased: every teal plant there is TALL and every
   orange plant SHORT, so height looks like it matters. */
const P = (id, height, hue, label) => ({ id, height, hue, label });

// Hue: 0 = pure teal … 1 = pure orange; teal-leaved plants sit near 0.3,
// orange-leaved near 0.7 (clearly different colours on screen). After
// scaling, the height gap (tall vs short) is bigger than the colour gap —
// which is exactly why the biased first garden misleads the model.
export const LEVEL = {
  // first garden (near the lab): biased examples
  garden1: [P('g1', 78, 0.28, 'water'), P('g2', 84, 0.30, 'water'), P('g3', 72, 0.25, 'water'),
            P('g4', 18, 0.72, 'desert'), P('g5', 24, 0.75, 'desert'), P('g6', 15, 0.68, 'desert')],
  // the test plant on the gate pedestal: short and teal → water.
  // With only garden-1 examples its nearest neighbour is g6 (short, orange).
  gate: P('t1', 20, 0.28, 'water'),
  // second garden (behind the lab): examples that break the false pattern
  garden2: [P('h1', 22, 0.30, 'water'), P('h2', 28, 0.26, 'water'),
            P('h3', 80, 0.70, 'desert'), P('h4', 70, 0.74, 'desert'),
            P('h5', 82, 0.27, 'water')],       // "more of the same": tall teal — does not help
  // final check plants, never usable as examples. c2 (tall orange) is only
  // right if a tall orange example was added — variety matters, not volume.
  check: [P('c1', 30, 0.30, 'water'), P('c2', 76, 0.72, 'desert'), P('c3', 50, 0.28, 'water'), P('c4', 40, 0.70, 'desert')],
  // borderline plant for 11+: its colour is close to the middle
  border: P('c5', 45, 0.46, 'water'),
};

/* ── Age variants: starting settings, not a judgement of ability ──
   They change the TASK (how many examples, what is checked, what is
   compared and explained), not just speed. */
const ids = (list, want) => list.filter((p) => want.includes(p.id));
export const AGES = {
  tiny: {   // 5–7, with an adult: two clear kinds, 3–4 examples, one check
    garden1: ids(LEVEL.garden1, ['g1', 'g3', 'g4', 'g6']), garden2: ids(LEVEL.garden2, ['h1', 'h5']),
    need: { water: 1, desert: 1, total: 3 }, check: [], guessFirst: false, compare: false, memorise: false, border: false,
  },
  child: {  // 8–10: two features, several checks, fix one mistake, guess before the program
    garden1: LEVEL.garden1, garden2: ids(LEVEL.garden2, ['h1', 'h2', 'h3', 'h5']),
    need: { water: 2, desert: 2, total: 4 }, check: LEVEL.check, guessFirst: true, compare: false, memorise: false, border: false,
  },
  teen: {   // 11–13: unbalanced set, a borderline case, compare two sets, explain the cause
    garden1: LEVEL.garden1, garden2: LEVEL.garden2,
    need: { water: 2, desert: 2, total: 4 }, check: [...LEVEL.check, LEVEL.border], guessFirst: true, compare: true, memorise: false, border: true,
  },
  adult: {  // 14+: training vs check data, compare results, limits; memorising ≠ generalising
    garden1: LEVEL.garden1, garden2: LEVEL.garden2,
    need: { water: 2, desert: 2, total: 4 }, check: [...LEVEL.check, LEVEL.border], guessFirst: true, compare: true, memorise: true, border: true,
  },
};

// Accuracy on the examples themselves. For 1-nearest-neighbour this is
// always 100% (each example is its own nearest neighbour) — which is the
// point: remembering the examples says nothing about new plants.
export function trainingAccuracy(examples) {
  const r = evaluate(examples, examples);
  return r;
}
