'use strict';
// Execution smoke test for js/racing.js — same jsdom approach as the other
// two harnesses. For each age: pick the first track, hit Start, then let
// real wall-clock time pass with NO lane-change input for 3s (forces real
// hazard collisions -> takeHit -> checkpoint respawn), then mash left/
// right/boost for 4s, then exit. Also forces a full win on a 1-letter
// track to hit the finishRun overlay/stars/achievements/leaderboard path.

const { JSDOM } = require('jsdom');
const fs = require('fs');

const errors = [];

const dom = new JSDOM('<!doctype html><html><body><div id="container"></div></body></html>', {
  url: 'http://localhost/ru.html',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});
const { window } = dom;

window.HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  const ctx = {
    save: noop, restore: noop, translate: noop, rotate: noop, scale: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, arc: noop, arcTo: noop, ellipse: noop, quadraticCurveTo: noop,
    closePath: noop, fill: noop, stroke: noop, fillRect: noop, clearRect: noop,
    fillText: noop, strokeText: noop, drawImage: noop, setLineDash: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    measureText: (s) => ({ width: (s || '').length * 8 }),
    set fillStyle(v) {}, get fillStyle() { return '#000'; },
    set strokeStyle(v) {}, get strokeStyle() { return '#000'; },
    set font(v) { this._font = v; }, get font() { return this._font || '10px sans-serif'; },
    set lineWidth(v) {}, set lineCap(v) {}, set lineJoin(v) {}, set textAlign(v) {}, set textBaseline(v) {},
    set globalAlpha(v) {}, set shadowBlur(v) {}, set shadowColor(v) {},
    set globalCompositeOperation(v) {}, set lineDashOffset(v) {},
  };
  return ctx;
};

window.addEventListener('error', (e) => {
  errors.push('window.onerror: ' + e.message + (e.error && e.error.stack ? '\n' + e.error.stack : ''));
});
process.on('unhandledRejection', (e) => errors.push('unhandledRejection: ' + e));
process.on('uncaughtException', (e) => errors.push('uncaughtException: ' + e.stack));

function loadScript(path) {
  const code = fs.readFileSync(path, 'utf8');
  const el = window.document.createElement('script');
  el.textContent = code;
  window.document.head.appendChild(el);
}
try {
  loadScript('js/leaderboard.js');
  loadScript('js/racing.js');
} catch (e) {
  console.log('LOAD-TIME CRASH:', e.stack);
  process.exit(1);
}
if (!window.KAT_Racing || !window.KAT_Leaderboard) {
  console.log('FAIL: window.KAT_Racing / window.KAT_Leaderboard never assigned (silent load-time failure)');
  process.exit(1);
}

const lessons = [
  { icon: '🤖', title: 'Что такое ИИ?', text: 'Короткое вступление про ИИ для теста.' },
  { icon: '🧠', title: 'Как ИИ учится', text: 'Ещё одно вступление подлиннее, чтобы проверить перенос строк в карточке урока.' },
  { icon: '🛡️', title: 'Безопасность', text: 'Третий урок.' },
  { icon: '🔬', title: 'Ограничения ИИ', text: 'Четвёртый урок.' },
];
const rounds = [
  { unit: 'letter', targets: ['Б', 'О', 'Т'], decoys: ['Ж'], icon: '🤖', fact: 'Факт про бота.' },
  { unit: 'word', targets: ['ИИ', 'УЧИТСЯ'], decoys: [], icon: '🧠', fact: 'Факт про обучение.' },
  { unit: 'letter', targets: ['А', 'Й'], decoys: [], icon: '🛡️', fact: 'Факт про безопасность.' },
  { unit: 'phrase', targets: ['НЕ', 'ВСЕГДА', 'ПРАВ'], decoys: [], icon: '🔬', fact: 'Факт про ограничения.' },
];

const container = window.document.getElementById('container');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function testAge(age) {
  console.log('--- age:', age, '---');
  window.KAT_Racing.startWorldSelect(container, {
    age, lang: 'ru', lessons, rounds,
    onAllDone() { console.log('  onAllDone fired'); },
  });

  const cards = container.querySelectorAll('.pf-world-card');
  console.log('  track cards rendered:', cards.length);
  if (!cards.length) { errors.push(`[${age}] no track cards rendered`); return; }

  cards[0].dispatchEvent(new window.Event('click', { bubbles: true }));
  const startBtn = container.querySelector('#rc-start-btn');
  if (!startBtn) { errors.push(`[${age}] no #rc-start-btn after picking a track`); return; }
  startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));

  // Phase 1: zero lane-change input for 3s — forces the car to stay put
  // and eat whatever hazards line up in its lane (checkpoint-respawn path).
  await sleep(3000);
  if (errors.length) return;
  console.log('  survived 3s with zero input (forced hits)');

  // Phase 2: mash left/right/boost for 4s.
  const left = () => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  const right = () => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }));
  const boost = () => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ' }));
  for (let i = 0; i < 40; i++) {
    (i % 2 === 0 ? left : right)();
    if (i % 5 === 0) boost();
    await sleep(100);
    if (errors.length) return;
  }
  console.log('  survived 4s of left/right/boost input');

  const exitBtn = container.querySelector('#rc-exit');
  if (exitBtn) {
    exitBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    await sleep(200);
    console.log('  exit button exercised');
  }
}

async function testWinPath() {
  console.log('--- forced win path (tiny, 1-letter track) ---');
  const tinyLessons = [{ icon: '🤖', title: 'Тест', text: 'Мини-трасса для проверки победы.' }];
  const tinyRounds = [{ unit: 'letter', targets: ['А'], decoys: [], icon: '🤖', fact: 'Единственная буква.' }];
  window.KAT_Racing.startWorldSelect(container, {
    age: 'tiny', lang: 'ru', lessons: tinyLessons, rounds: tinyRounds,
    onAllDone() { console.log('  onAllDone fired'); },
  });
  const cards = container.querySelectorAll('.pf-world-card');
  if (!cards.length) { errors.push('[win-path] no track cards for 1-letter track'); return; }
  cards[0].dispatchEvent(new window.Event('click', { bubbles: true }));
  const startBtn = container.querySelector('#rc-start-btn');
  if (!startBtn) { errors.push('[win-path] no start button'); return; }
  startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));

  await sleep(4000);
  if (errors.length) return;

  const overlay = container.querySelector('#rc-overlay');
  const overlayVisible = overlay && !overlay.classList.contains('hidden');
  console.log('  after 4s: overlay visible =', overlayVisible);
  if (!overlayVisible) { errors.push('[win-path] track-clear overlay never appeared after 4s on a 1-letter track'); return; }

  const againBtn = container.querySelector('#rc-again-btn');
  const backBtn = container.querySelector('#rc-back-btn');
  if (!againBtn || !backBtn) { errors.push('[win-path] finish overlay missing again/back buttons'); return; }
  console.log('  win overlay rendered with again/back buttons, no crash');

  backBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(200);
  console.log('  back-to-tracks exercised');
}

(async () => {
  for (const age of ['tiny', 'child', 'teen', 'adult']) {
    await testAge(age);
    if (errors.length) break;
  }
  if (!errors.length) await testWinPath();

  if (errors.length) {
    console.log('\n=== ERRORS FOUND ===');
    errors.forEach(e => console.log(e, '\n'));
    process.exit(1);
  } else {
    console.log('\n=== NO ERRORS CAUGHT ACROSS ALL 4 AGES (racing.js) ===');
    process.exit(0);
  }
})();
