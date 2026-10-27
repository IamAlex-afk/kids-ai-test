/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST  ·  workshop.js
   Interactive part of the workshop activities (tools/gen-series.mjs).
   One step template for every activity:
     goal → guess → action → result → explanation → new example → next
   One step on screen at a time; "Back" / "Next"; a wrong answer gets a
   calm explanation and a retry; nothing moves on by itself.

   Stores nothing and sends nothing: answers live in this page's memory
   only. Speech is not used here (the page's "Listen" button, if any, is
   js/lesson.js). Content comes from <script type="application/json"
   id="wk-data"> written by the generator.
═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const dataEl = document.getElementById('wk-data');
  const app = document.getElementById('wk-app');
  if (!dataEl || !app) return;
  const D = JSON.parse(dataEl.textContent);
  const SLUG = { '5-7': 'tiny', '8-10': 'child', '11-13': 'teen', '14-plus': 'adult' };

  // Age from the address (?age=8-10), else the page default. Changing it is
  // an ordinary link (the age switcher), so it also works without JS.
  const qAge = new URLSearchParams(location.search).get('age');
  const age = SLUG[qAge] || D.defaultAge;
  document.body.dataset.age = age;
  document.querySelectorAll('.wk-ageswitch a').forEach((a) => {
    if (SLUG[a.dataset.slug] === age) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });

  // texts: common, overridden by the age block
  const T = Object.assign({}, D.text.common, D.text[age] || {});
  const U = D.ui;
  const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : ''));

  /* ── tiny DOM helpers (text only through textContent) ── */
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null) e.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return e;
  }
  const say = (box, text, kind) => {          // feedback: words + sign, not colour only
    box.className = 'wk-fb' + (kind ? ' fb-' + kind : '');
    box.textContent = (kind === 'right' ? '✓ ' : kind === 'wrong' ? '✗ ' : '') + text;
  };

  /* ── step machine ── */
  // Each step: { title, render(body, done) } — call done() when the step's
  // task is finished; "Next" is enabled from then on.
  function runSteps(steps) {
    let i = 0;
    const doneSet = new Set();
    const counter = el('p', { class: 'wk-meta wk-stepno' });
    const h = el('h2', { class: 'wk-step-title', tabindex: '-1' });
    const body = el('div', { class: 'wk-step-body' });
    const back = el('button', { type: 'button', class: 'wk-btn', text: U.back, onclick: () => go(i - 1) });
    const next = el('button', { type: 'button', class: 'wk-btn wk-btn-main', text: U.next, onclick: () => go(i + 1) });
    const nav = el('div', { class: 'wk-step-nav' }, back, next);
    app.replaceChildren(counter, h, body, nav);
    // Rendered once per visit of a step: going Back and forth keeps answers.
    const bodies = steps.map(() => null);

    function go(n) {
      if (n < 0 || n >= steps.length) return;
      i = n;
      counter.textContent = fill(U.stepOf, { n: i + 1, m: steps.length });
      h.textContent = steps[i].title;
      if (!bodies[i] || steps[i].fresh) {
        bodies[i] = el('div');
        steps[i].render(bodies[i], () => { doneSet.add(n); sync(); });
      }
      body.replaceChildren(bodies[i]);
      sync();
      h.focus({ preventScroll: false });
    }
    function sync() {
      back.disabled = i === 0;
      next.hidden = i === steps.length - 1;
      next.disabled = !doneSet.has(i);
    }
    go(0);
  }

  // A question with fixed options. check(i) → { ok, text }. Wrong → explanation
  // + "Try again"; right → explanation, done(). Options stay readable.
  let qn = 0;
  function question(box, q, options, check, done) {
    const id = 'wk-q' + (++qn);
    const fb = el('p', { class: 'wk-fb', role: 'status', 'aria-live': 'polite', id: id + '-fb' });
    const retry = el('button', { type: 'button', class: 'wk-retry', text: U.retry, hidden: true });
    const btns = options.map((o, k) => el('li', null, el('button', {
      type: 'button', class: 'wk-opt', onclick: () => pick(k),
    }, o)));
    const list = el('ol', { class: 'wk-opts', 'aria-labelledby': id });
    list.append(...btns);
    box.append(el('p', { class: 'wk-check-q', id, text: q }), list, fb, retry);
    const buttons = btns.map((li) => li.firstChild);
    function pick(k) {
      const r = check(k);
      buttons.forEach((b) => { b.disabled = true; });
      buttons[k].classList.add(r.ok ? 'is-right' : 'is-wrong');
      buttons[k].setAttribute('aria-describedby', fb.id);
      say(fb, r.text, r.ok ? 'right' : 'wrong');
      retry.hidden = r.ok;
      if (r.ok) done && done(); else retry.focus();
    }
    retry.addEventListener('click', () => {
      buttons.forEach((b) => { b.disabled = false; b.classList.remove('is-right', 'is-wrong'); b.removeAttribute('aria-describedby'); });
      say(fb, '');
      retry.hidden = true;
      buttons[0].focus();
    });
  }

  // Links to other activities keep the chosen difficulty.
  const slugOf = Object.fromEntries(Object.entries(SLUG).map(([s, k]) => [k, s]));
  const withAge = (href) => (/^[\w-]+\.html$/.test(href) ? `${href}?age=${slugOf[age]}` : href);
  document.querySelectorAll('.wk-pager a.wk-pg-next').forEach((a) => { a.href = withAge(a.getAttribute('href')); });

  // "Print the task" (the printable part is styled by @media print)
  document.querySelectorAll('[data-print]').forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => window.print());
  });

  const KINDS = {};
  let started = false;
  function start() {
    const kind = KINDS[D.kind];
    if (!kind || started) return;
    started = true;
    document.documentElement.classList.add('wk-js');
    // .wk-wait (set in <head>) keeps the parts below hidden until now, so
    // filling the activity does not visibly push them down (CLS).
    try { kind({ D, T, U, age, el, say, fill, question, runSteps }); }
    finally { document.documentElement.classList.remove('wk-wait'); }
  }
  // Activity modules register themselves below this file. The page's own
  // module starts the activity at once (still while the page is parsed), so
  // the first paint already has it and nothing below jumps down (CLS).
  window.KAT_Workshop = { register: (k, fn) => { KINDS[k] = fn; if (k === D.kind) start(); }, el, say, fill, question, runSteps, withAge };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();
