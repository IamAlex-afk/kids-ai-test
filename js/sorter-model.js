/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  sorter-model.js
   The teaching model of the lesson "Why did the sorter get it wrong?".

   NOT a neural network and NOT image recognition. Each card already comes
   with two ready-made features (shape, background); the model never sees
   pixels. It is a one-feature rule learner:
     1. for each feature, build a rule "value → most common category" from
        the TRAINING cards only;
     2. count that rule's mistakes on the training cards;
     3. keep the feature with the fewest mistakes;
     4. on a tie, prefer the feature listed first in TIE_ORDER — a fixed,
        visible design choice of this demo (background first, so that the
        misleading pattern shows up), not a property of machine learning.
   Inside one feature value, a tie between categories goes to the category
   listed first in the card set's `categories`.

   Pure functions, no randomness, no state: the same training cards always
   give the same rule. Test cards are never used for training.
═══════════════════════════════════════════════════════════════════ */

(function (root) {
  'use strict';

  const TIE_ORDER = ['bg', 'shape'];

  // rule for one feature: { value: category } from training cards
  function ruleFor(feature, train, categories) {
    const counts = {};
    for (const c of train) {
      const v = c[feature];
      counts[v] = counts[v] || {};
      counts[v][c.label] = (counts[v][c.label] || 0) + 1;
    }
    const rule = {};
    for (const v of Object.keys(counts)) {
      let best = null;
      for (const cat of categories) {
        const n = counts[v][cat] || 0;
        if (best === null || n > (counts[v][best] || 0)) best = cat;
      }
      rule[v] = best;
    }
    return rule;
  }

  function mistakes(feature, rule, cards) {
    return cards.filter((c) => rule[c[feature]] !== c.label).length;
  }

  // train(cards, categories) → { feature, rule, errors: {bg, shape}, tie }
  function train(cards, categories) {
    const errors = {}, rules = {};
    for (const f of TIE_ORDER) {
      rules[f] = ruleFor(f, cards, categories);
      errors[f] = mistakes(f, rules[f], cards);
    }
    const min = Math.min(...TIE_ORDER.map((f) => errors[f]));
    const best = TIE_ORDER.filter((f) => errors[f] === min);
    const feature = best[0];
    return { feature, rule: rules[feature], rules, errors, tie: best.length > 1 };
  }

  // null = the rule has never seen this value ("I don't know")
  function predict(model, card) {
    const v = card[model.feature];
    return Object.prototype.hasOwnProperty.call(model.rule, v) ? model.rule[v] : null;
  }

  // check on separate cards: [{card, guess, ok}], right count
  function evaluate(model, testCards) {
    const rows = testCards.map((card) => {
      const guess = predict(model, card);
      return { card, guess, ok: guess === card.label };
    });
    return { rows, right: rows.filter((r) => r.ok).length, total: rows.length };
  }

  // The training set = starting cards + the extra cards the learner added.
  // Throws if a test card ends up in training: the check must stay honest.
  function trainingSet(start, extras, testCards) {
    const testIds = new Set(testCards.map((c) => c.id));
    const set = [...start, ...extras];
    for (const c of set) if (testIds.has(c.id)) throw new Error('test card used for training: ' + c.id);
    return set;
  }

  const api = { TIE_ORDER, ruleFor, mistakes, train, predict, evaluate, trainingSet };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KAT_Sorter = api;
})(typeof window !== 'undefined' ? window : globalThis);
