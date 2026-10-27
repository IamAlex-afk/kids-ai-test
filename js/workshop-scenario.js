/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  workshop-scenario.js
   Activities B "Check a confident answer" (kind 'check') and C "What is OK
   to share?" (kind 'share'). Both are scripted scenarios written in
   advance — no live chat, no AI request. Steps come from the page data
   (text[age].steps, else text.common.steps). A step can show:
     doc     — a source document (title + rows)
     bubble  — the made-up assistant's / character's text
     sources — two sources to compare (origin, date, what they say)
     questions — answered in order; wrong → explanation + retry
     redact  — pieces of a request to keep or remove; the check explains
               EVERY piece (needed for the task or not), computed from the
               data, not from which button was pressed last
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';
  const W = window.KAT_Workshop;
  if (!W) return;

  function scenario({ D, T, U, el, question, runSteps }) {
    const steps = (T.steps || []).map((st) => ({ title: st.title, render(box, done) {
      if (st.intro) box.append(el('p', { text: st.intro }));
      if (st.doc) {
        const rows = st.doc.rows.map(([k, v]) => el('tr', null, el('th', { scope: 'row', text: k }), el('td', { text: v })));
        box.append(el('div', { class: 'wk-doc' }, el('h3', { text: st.doc.title }),
          el('table', null, el('tbody', null, rows)), st.doc.note ? el('p', { text: st.doc.note }) : null));
      }
      if (st.bubble) box.append(el('p', { class: 'wk-bubble' }, el('b', { text: st.bubble.who }), st.bubble.text));
      if (st.sources) st.sources.forEach((s) => box.append(el('div', { class: 'wk-doc' },
        el('h3', { text: s.name }), el('p', null, el('b', { text: U.srcOrigin || '' }), s.origin),
        el('p', null, el('b', { text: U.srcDate || '' }), s.date), el('p', { text: s.says }))));

      const parts = [];
      (st.questions || []).forEach((q) => parts.push((next) => {
        const wrap = el('div', { class: 'wk-q-block' });
        box.append(wrap);
        question(wrap, q.q, q.options, (k) => (k === q.correct ? { ok: true, text: q.ok } : { ok: false, text: (q.no && q.no[k]) || q.noAll }), next);
      }));
      if (st.redact) parts.push((next) => redact(box, st.redact, next));
      // run the parts one after another; the step is done after the last,
      // and only then its conclusion (`after`) is shown
      const finish = () => { if (st.after) box.append(el('p', { class: 'wk-after', text: st.after })); done(); };
      const runPart = (i) => (i < parts.length ? parts[i](() => runPart(i + 1)) : finish());
      runPart(0);
    } }));

    // last step: free choice of what to do next
    steps.push({ title: T.doneH, render(box, done) {
      box.append(el('p', { text: T.doneText }));
      box.append(el('ul', { class: 'wk-choices' }, D.next.map((n, k) =>
        el('li', null, el('a', { class: 'wk-pg', href: W.withAge(n.href) }, T.choices[k])))));
      done();
    } });
    runSteps(steps);

    // Keep / remove pieces of a request. ok only when every piece that is not
    // needed for the task is removed AND every needed piece is kept; optional
    // pieces (needed: null) may go either way.
    function redact(box, R, done) {
      box.append(el('p', { class: 'wk-check-q', text: R.q }));
      const state = R.pieces.map(() => false);          // true = removed / replaced
      const chips = R.pieces.map((p, i) => el('button', { type: 'button', class: 'wk-chip', 'aria-pressed': 'false',
        onclick: (e) => { state[i] = !state[i]; e.currentTarget.setAttribute('aria-pressed', String(state[i])); } }, p.text));
      const fb = el('div', { class: 'wk-fb', role: 'status', 'aria-live': 'polite' });
      const check = el('button', { type: 'button', class: 'wk-btn wk-btn-main', text: R.checkBtn, onclick: () => {
        // needed: true = keep, false = remove, null = either is fine (harmless
        // but not required — a child who removes it is not wrong).
        const rows = R.pieces.map((p, i) => {
          const fine = p.needed === null || state[i] === !p.needed;
          return { fine, line: `${p.needed === null ? '•' : fine ? '✓' : '✗'} ${U.qL}${p.text}${U.qR} — ${p.why}` };
        });
        const ok = rows.every((r) => r.fine);
        fb.className = 'wk-fb ' + (ok ? 'fb-right' : 'fb-wrong');
        fb.replaceChildren(el('p', { text: (ok ? '✓ ' : '✗ ') + (ok ? R.ok : R.no) }),
          el('ul', null, rows.map((r) => el('li', { text: r.line }))));
        if (ok) { chips.forEach((c) => { c.disabled = true; }); check.disabled = true; if (R.result) fb.append(el('p', null, el('b', { text: R.resultH + ' ' }), R.result)); done(); }
      } });
      box.append(el('div', { class: 'wk-chips' }, chips), check, fb);
    }
  }

  W.register('check', scenario);
  W.register('share', scenario);
})();
