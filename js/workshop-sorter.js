/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  workshop-sorter.js
   Activity A "Why did the sorter get it wrong?" (kind 'sorter').
   Every answer of the sorter is computed by js/sorter-model.js from the
   cards actually in training — never from which button was pressed.
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  const W = window.KAT_Workshop, M = window.KAT_Sorter;
  if (!W || !M) return;

  const BG = { blue: '#9fd3f5', yellow: '#ffe27a', green: '#a8dfa0', purple: '#d6bff2' };
  const INK = '#2b2a55';
  const NS = 'http://www.w3.org/2000/svg';

  function shapeEl(shape) {
    const s = document.createElementNS(NS, shape === 'circle' ? 'circle' : shape === 'square' ? 'rect' : 'polygon');
    if (shape === 'circle') { s.setAttribute('cx', 40); s.setAttribute('cy', 40); s.setAttribute('r', 22); }
    else if (shape === 'square') { s.setAttribute('x', 19); s.setAttribute('y', 19); s.setAttribute('width', 42); s.setAttribute('height', 42); s.setAttribute('rx', 3); }
    else if (shape === 'triangle') s.setAttribute('points', '40,15 64,62 16,62');
    else s.setAttribute('points', '40,13 47,32 67,32 51,44 57,64 40,52 23,64 29,44 13,32 33,32');   // star
    s.setAttribute('fill', INK);
    return s;
  }

  // A card: picture + its two features in words (not colour only).
  function cardView(c, words, extra) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 80 80');
    svg.setAttribute('width', '80'); svg.setAttribute('height', '80');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    const bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', 80); bg.setAttribute('height', 80); bg.setAttribute('rx', 10);
    bg.setAttribute('fill', BG[c.bg]);
    svg.append(bg, shapeEl(c.shape));
    return W.el('figure', { class: 'wk-card-pic' + (extra ? ' ' + extra : '') }, svg,
      W.el('figcaption', null, `${words[c.shape]}, ${words[c.bg]}`));
  }
  const cardRow = (cards, words) => W.el('div', { class: 'wk-cards' }, cards.map((c) => cardView(c, words)));

  W.register('sorter', ({ D, T, U, age, el, say, fill, question, runSteps }) => {
    const A = D.data.ages[age], cats = D.data.categories, words = T.words;
    const showErrors = age !== 'tiny';
    const errLine = (m) => fill(T.errorsRow, { shape: m.errors.shape, bg: m.errors.bg });
    const before = M.train(A.start, cats.main);
    let chosen = [];                       // extra cards chosen by the learner
    let after = null;

    const steps = [];

    // 1. guess, then ask the sorter
    steps.push({ title: T.predictH, render(box, done) {
      if (T.adultSay) box.append(el('p', { class: 'wk-tiny-note', text: T.adultSay }));
      box.append(el('p', { class: 'wk-goal', text: T.goal }));
      box.append(el('h3', { text: T.trainH }), cardRow(A.start, words));
      box.append(el('p', { class: 'wk-check-q', text: T.predictQ }), cardRow([A.probe], words));
      const fb = el('p', { class: 'wk-fb', role: 'status', 'aria-live': 'polite' });
      const guessBox = el('div');
      let guessed = null;
      const opts = cats.main.map((c) => el('button', { type: 'button', class: 'wk-opt', 'aria-pressed': 'false',
        onclick: (e) => { guessed = c; opts.forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); run.disabled = false; } }, words[c]));
      const run = el('button', { type: 'button', class: 'wk-btn wk-btn-main', text: T.runBtn, disabled: true, onclick: () => {
        const g = M.predict(before, A.probe);
        say(fb, fill(T.said, { guess: g ? words[g] : words.unknown }) + ' ' + T.wrongWhy + ' ' + T.tieNote, g === A.probe.label ? 'right' : 'wrong');
        if (showErrors) guessBox.replaceChildren(el('p', { class: 'wk-errors' }, el('b', { text: T.errorsH + ': ' }), errLine(before)));
        run.disabled = true;
        done();
      } });
      box.append(el('div', { class: 'wk-opts wk-opts-row' }, opts), run, fb, guessBox);
    } });

    // 2. choose extra training cards, train again (really recomputed)
    steps.push({ title: T.addH, render(box, done) {
      box.append(el('p', { class: 'wk-check-q', text: fill(T.addQ, { pick: A.pick }) }));
      const fb = el('p', { class: 'wk-fb', role: 'status', 'aria-live': 'polite' });
      const errs = el('div');
      const toggles = A.extras.map((c) => {
        const b = el('button', { type: 'button', class: 'wk-pick', 'aria-pressed': 'false', onclick: () => {
          const on = b.getAttribute('aria-pressed') !== 'true';
          if (on && chosen.length >= A.pick) { say(fb, fill(U.limit, { pick: A.pick })); return; }
          b.setAttribute('aria-pressed', String(on));
          chosen = on ? [...chosen, c] : chosen.filter((x) => x.id !== c.id);
        } }, cardView(c, words));
        return b;
      });
      const retrain = el('button', { type: 'button', class: 'wk-btn wk-btn-main', text: T.retrainBtn, onclick: () => {
        if (!chosen.length) { say(fb, T.needPick); return; }
        after = M.train(M.trainingSet(A.start, chosen, A.test), cats.main);
        const fixed = after.feature === 'shape';
        say(fb, fill(T.nowRule, { feature: words[after.feature] }) + ' ' + (fixed ? T.fixedWhy : T.sameWhy), fixed ? 'right' : 'wrong');
        if (showErrors) errs.replaceChildren(el('p', { class: 'wk-errors' }, el('b', { text: T.errorsH + ': ' }),
          `${U.before}: ${errLine(before)} → ${U.after}: ${errLine(after)}`));
        if (fixed) done();
      } });
      box.append(el('div', { class: 'wk-cards wk-cards-pick' }, toggles), retrain, fb, errs);
    } });

    // 3. check on separate cards (never used for training). Rebuilt on every
    // visit: if the learner went back and changed the cards, the check follows.
    steps.push({ title: T.testH, fresh: true, render(box, done) {
      box.append(el('p', { text: T.testNote }));
      const r = M.evaluate(after || before, A.test);
      const list = el('ul', { class: 'wk-results' });
      r.rows.forEach((row) => list.append(el('li', { class: row.ok ? 'is-right' : 'is-wrong' },
        cardView(row.card, words), el('span', { text: `${row.ok ? '✓' : '✗'} ${U.modelSaid}: ${row.guess ? words[row.guess] : words.unknown}` }))));
      box.append(list, el('p', { class: 'wk-score', text: fill(T.testScore, { right: r.right, total: r.total }) }));
      if (T.whyTestQ) {
        question(box, T.whyTestQ, T.whyTestOpts, (k) => (k === 0 ? { ok: true, text: T.whyTestOk } : { ok: false, text: T.whyTestNo }), done);
      } else done();
    } });

    // 3b. 14+: limits of the method and consequences
    if (T.limitsH) steps.push({ title: T.limitsH, render(box, done) {
      box.append(el('ul', { class: 'wk-limits' }, T.limits.map((s) => el('li', { text: s }))));
      question(box, T.stakesQ, T.stakesOpts, (k) => (k === 0 ? { ok: true, text: T.stakesOk } : { ok: false, text: T.stakesNo }), done);
    } });

    // 4. new example: other features, same kind of mistake — solved by the learner
    steps.push({ title: T.newH, render(box, done) {
      const N = D.data.transfer;
      const m0 = M.train(N.start, cats.transfer);
      const g0 = M.predict(m0, N.probe);                     // computed, not assumed
      box.append(el('p', { text: T.newIntro }), el('h3', { text: T.trainH }), cardRow(N.start, words), cardRow([N.probe], words));
      const part2 = el('div', { hidden: true });
      question(box, T.newQ1, cats.transfer.map((c) => words[c]),
        (k) => (cats.transfer[k] === g0 ? { ok: true, text: T.q1ok } : { ok: false, text: T.q1no }),
        () => { part2.hidden = false; });
      box.append(part2);
      part2.append(el('p', { class: 'wk-check-q', text: T.newQ2 }));
      const fb = el('p', { class: 'wk-fb', role: 'status', 'aria-live': 'polite' });
      const retry = el('button', { type: 'button', class: 'wk-retry', text: U.retry, hidden: true });
      const fixes = N.fixes.map((c) => el('button', { type: 'button', class: 'wk-pick', onclick: () => {
        const m1 = M.train([...N.start, c], cats.transfer);
        const ok = M.predict(m1, N.probe) === N.probe.label;
        fixes.forEach((b) => { b.disabled = true; });
        say(fb, ok ? T.newOk : T.newNo, ok ? 'right' : 'wrong');
        retry.hidden = ok;
        if (ok) done(); else retry.focus();
      } }, cardView(c, words)));
      retry.addEventListener('click', () => { fixes.forEach((b) => { b.disabled = false; }); say(fb, ''); retry.hidden = true; fixes[0].focus(); });
      part2.append(el('div', { class: 'wk-cards wk-cards-pick' }, fixes), fb, retry);
    } });

    // 5. free choice of the next step
    steps.push({ title: T.doneH, render(box, done) {
      box.append(el('p', { text: T.doneText }));
      const links = D.next.map((n, k) => el('li', null, el('a', { class: 'wk-pg', href: W.withAge(n.href) }, T.choices[k])));
      box.append(el('ul', { class: 'wk-choices' }, links));
      done();
    } });

    runSteps(steps);
  });
})();
