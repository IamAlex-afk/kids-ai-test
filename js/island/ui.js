/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · island/ui.js
   Everything the player reads or presses is ordinary HTML over the 3D
   scene (no text baked into images): goal, example counter, prompts,
   on-screen controls, pause/settings/guess/results/summary dialogs, and
   the text version of the same task. Text only via textContent.
═══════════════════════════════════════════════════════════════════ */

import { LEVEL } from './model.js';

export function createUI(o) {
  const { T, fill, game, settings, ageKey, lang, describe, needText, countKinds } = o;
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') e.textContent = v; else if (k === 'class') e.className = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(String(c))));
    return e;
  };
  const icon = (label) => el('span', { class: 'isl-ico isl-ico-' + label, 'aria-hidden': 'true' });   // drop / sun shapes (CSS)

  // static texts
  document.title = `${T.title} — Kids AI Test`;
  $('isl-title').textContent = T.title;
  $('isl-sub').textContent = `${T.sub} · ${T.ages[ageKey]}`;
  $('isl-loading').textContent = T.loading;
  $('isl-placeholder').textContent = T.placeholder;
  $('isl-privacy').textContent = T.privacy;
  const btns = { 'isl-pause': T.pause, 'isl-settings': T.settings, 'isl-text': T.textMode, 'isl-exit': T.exit };
  Object.entries(btns).forEach(([id, t]) => { $(id).textContent = t; });
  [['isl-up', T.up], ['isl-down', T.down], ['isl-left', T.left], ['isl-right', T.right], ['isl-act', T.act]].forEach(([id, t]) => $(id).setAttribute('aria-label', t));
  $('isl-act-label').textContent = T.act;
  document.querySelector('.isl-menu')?.setAttribute('aria-label', T.menuLabel);
  document.querySelector('.isl-pad')?.setAttribute('aria-label', T.padLabel);

  $('isl-pause').addEventListener('click', () => o.onPause(true));
  $('isl-settings').addEventListener('click', openSettings);
  $('isl-text').addEventListener('click', () => o.onText());
  $('isl-exit').addEventListener('click', () => o.onExit());
  $('isl-act').addEventListener('click', () => o.onAction());

  const backHref = () => `../${lang === 'en' ? 'index' : lang}.html`;

  /* ── dialogs (one at a time, focus kept inside, Escape closes) ── */
  const dlg = $('isl-dialog');
  let lastFocus = null, onClose = null;
  function open(title, body, actions, closeCb) {
    lastFocus = document.activeElement;
    onClose = closeCb || null;
    $('isl-dialog-title').textContent = title;
    $('isl-dialog-body').replaceChildren(...[].concat(body));
    $('isl-dialog-actions').replaceChildren(...actions);
    dlg.hidden = false;
    (actions[0] || $('isl-dialog-title')).focus();
  }
  function close() {
    if (dlg.hidden) return;
    dlg.hidden = true;
    const cb = onClose; onClose = null;
    cb && cb();
    (lastFocus && document.contains(lastFocus) ? lastFocus : $('isl-act')).focus?.();
  }
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const f = [...dlg.querySelectorAll('button, a, input')].filter((x) => !x.disabled);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  const btn = (text, fn, cls = 'isl-btn') => el('button', { type: 'button', class: cls, text, onclick: fn });

  /* ── public ── */
  function update() {
    const g = game;
    $('isl-goal').textContent = fill(T.goal[g.stage] || '', { need: needText(g) });
    const c = countKinds(g);
    $('isl-count').replaceChildren(el('span', { class: 'isl-count-h', text: T.examples + ':' }),
      el('span', { class: 'isl-count-i' }, icon('water'), ` ${c.water} ${T.waterShort}`),
      el('span', { class: 'isl-count-i' }, icon('desert'), ` ${c.desert} ${T.desertShort}`));
  }
  function say(text) {
    const box = $('isl-say');
    box.textContent = text;
    box.hidden = !text;
  }
  function near(info) {
    const box = $('isl-near');
    if (!info) { box.hidden = true; $('isl-act').disabled = true; return; }
    box.hidden = false;
    $('isl-act').disabled = false;
    const parts = [el('b', { text: info.text })];
    if (info.plant) {
      const d = describe(info.plant);
      parts.push(el('span', { class: 'isl-near-p' }, ` · ${d.h} ${d.cm}, ${d.c}`));
      if (info.tag) parts.push(el('span', { class: 'isl-near-p' }, ' · ', icon(info.plant.label), ` ${T[info.plant.label]}`));
    }
    box.replaceChildren(...parts);
  }
  function askGuess(cb) {
    open(T.guessQ, el('p', { text: `${describe(LEVEL.gate).h} ${T.cm}, ${describe(LEVEL.gate).c}` }), [
      btn(T.water, () => { close(); cb('water'); }, 'isl-btn isl-btn-big'),
      btn(T.desert, () => { close(); cb('desert'); }, 'isl-btn isl-btn-big'),
    ]);
    [...$('isl-dialog-actions').children].forEach((b, i) => b.prepend(icon(i ? 'desert' : 'water'), ' '));
  }
  function resultList(res) {
    return el('ul', { class: 'isl-results' }, res.rows.map((r) => {
      const d = describe(r.plant);
      return el('li', { class: r.ok ? 'ok' : 'bad' }, `${r.ok ? '✓' : '✗'} ${d.h} ${d.cm}, ${d.c} → `, icon(r.guess), ` ${T[r.guess]} (${r.ok ? T.ok : T.wrong})`);
    }));
  }
  function showCheck(out) {
    const body = [el('p', { text: fill(T.checkRes, { right: out.res.right, total: out.res.total }) }), resultList(out.res)];
    body.push(el('p', { text: out.res.right === out.res.total ? T.checkOk : T.checkFail }));
    if (out.before) {
      body.push(el('h3', { text: T.compareH }),
        el('table', { class: 'isl-compare' }, el('tbody', null,
          el('tr', null, el('th', { scope: 'row', text: T.setBefore }), el('td', { text: `${out.before.right} / ${out.before.total}` })),
          el('tr', null, el('th', { scope: 'row', text: T.setAfter }), el('td', { text: `${out.res.right} / ${out.res.total}` })))));
      if (game.A.border) body.push(el('p', { text: T.border }));
    }
    if (out.memo) body.push(el('p', { text: fill(T.memorise, { right: out.memo.right, total: out.memo.total, cright: out.res.right, ctotal: out.res.total }) }));
    open(T.near.station, body, [btn(T.resume, close)]);
  }
  function finale() {
    const lim = T.limits[ageKey] || T.limits.child;
    const body = [el('h3', { text: T.finaleH }), el('ul', null, T.learned.map((s) => el('li', { text: s }))),
      el('h3', { text: T.limitsH }), el('ul', null, lim.map((s) => el('li', { text: s })))];
    open(T.goal.done, body, [btn(T.again, () => o.onRestart()), el('a', { class: 'isl-btn', href: backHref(), text: T.backSite }),
      el('a', { class: 'isl-btn', href: `../lessons/${lang}/`, text: T.toLessons })]);
    $('isl-goal').textContent = T.goal.done;
  }
  function paused(p) {
    // On phones this is the only menu (the top bar keeps just "Pause"),
    // so every option is reachable from here.
    if (p) open(T.paused, el('p', { text: T.controlsHelp }), [btn(T.resume, close), btn(T.restart, () => o.onRestart()),
      btn(T.settings, () => { close(); openSettings(); }), btn(T.textMode, () => { close(); o.onText(); }),
      el('a', { class: 'isl-btn', href: backHref(), text: T.exit })], () => o.onPause(false));
  }
  function openSettings() {
    const box = (key, label) => {
      const id = 'isl-set-' + key;
      const input = el('input', { type: 'checkbox', id });
      input.checked = !!settings[key];
      input.addEventListener('change', () => { settings[key] = input.checked; o.onSettings(); });
      return el('p', { class: 'isl-check' }, input, el('label', { for: id, text: label }));
    };
    open(T.settings, [box('calm', T.calm), box('hints', T.hints), box('low', T.lowGfx)], [btn(T.resume, close)]);
  }
  function bindPad(cb) {
    const map = { 'isl-up': [0, -1], 'isl-down': [0, 1], 'isl-left': [-1, 0], 'isl-right': [1, 0] };
    const held = new Set();
    const push = () => { let x = 0, z = 0; held.forEach((id) => { x += map[id][0]; z += map[id][1]; }); cb(x, z); };
    Object.keys(map).forEach((id) => {
      const b = $(id);
      const down = (e) => { e.preventDefault(); held.add(id); b.setPointerCapture?.(e.pointerId); push(); };
      const up = () => { held.delete(id); push(); };
      b.addEventListener('pointerdown', down);
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, up));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }
  function lost() {
    open(T.lost, el('p', { text: T.noWebgl }), [btn(T.retry, () => location.reload()), btn(T.textMode, () => { close(); o.onText(); })]);
  }
  function ready3d() { $('isl-loading').hidden = true; document.body.classList.add('isl-3d'); }
  function fps(n) { const f = $('isl-fps'); if (f) f.textContent = `${Math.round(n)} fps`; }

  /* ── text version: the same task with buttons and lists ── */
  function textVersion(api) {
    document.body.classList.remove('isl-3d');
    document.body.classList.add('isl-textmode');
    $('isl-loading').hidden = true;
    $('isl-text').textContent = T.play3d;
    $('isl-text').onclick = () => o.on3d();
    const g = api.game;
    const root = $('isl-textroot');
    root.hidden = false;
    const render = () => {
      const plantBtn = (p, locked) => {
        const d = describe(p);
        const on = g.examples.some((e) => e.id === p.id);
        return el('li', null, el('button', { type: 'button', class: 'isl-plant', 'aria-pressed': String(on), disabled: locked,
          onclick: () => { const r = api.toggleExample(g, p); say(r === 'added' ? fill(T.added, d) : r === 'removed' ? T.removed : T.near.locked); render(); } },
        icon(p.label), ` ${T[p.label]} · ${d.h} ${d.cm}, ${d.c}`));
      };
      const parts = [el('p', { text: T.textIntro }), el('p', { class: 'isl-goal-t', text: fill(T.goal[g.stage] || '', { need: needText(g) }) }),
        el('h2', { text: T.gardenWest }), el('ul', { class: 'isl-plants' }, g.A.garden1.map((p) => plantBtn(p, false))),
        el('h2', { text: T.gardenNorth }), el('ul', { class: 'isl-plants' }, g.A.garden2.map((p) => plantBtn(p, !g.garden2Open))),
        el('h2', { text: T.gatePlant }), el('p', { text: `${describe(LEVEL.gate).h} ${T.cm}, ${describe(LEVEL.gate).c}` }),
        btn(T.testBtn, () => {
          if (!api.enough(g)) { say(fill(T.notEnough, { need: needText(g) })); return; }
          const go = () => {
            const r = api.testGate(g);
            const n = r.r.nearest;
            say([fill(T.said, { kind: T[r.r.label] }), fill(T.why, { near: T[n.label], ...describe(n) }), r.right ? T.rightGate : (g.gateTries > 1 ? T.sameMore : T.wrongGate + ' ' + T.garden2Open)].join(' '));
            if (r.right && !g.A.check.length) g.stage = 'finale';
            render();
          };
          if (g.A.guessFirst && g.gateTries === 0 && g.guess === null) askGuess((x) => { g.guess = x; go(); }); else go();
        }, 'isl-btn isl-btn-main')];
      if (g.bridgeOpen && g.A.check.length) parts.push(el('h2', { text: T.checkPlants }), btn(T.checkBtn, () => { showCheck(api.runCheck(g)); render(); }, 'isl-btn isl-btn-main'));
      if (g.stage === 'finale') parts.push(btn(T.near.finale, () => { api.finish(); finale(); }, 'isl-btn isl-btn-main'));
      root.replaceChildren(...parts);
    };
    render();
  }

  update();
  near(null);
  return { update, say, near, askGuess, showCheck, finale, paused, bindPad, lost, ready3d, fps, textVersion, backHref, modalOpen: () => !dlg.hidden };
}
