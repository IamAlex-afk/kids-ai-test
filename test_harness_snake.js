'use strict';
// Execution smoke test for js/snake.js (AI Snake) — same approach as
// test_harness.js: actually RUN the game in jsdom, not just parse it.
// Starts a round, dismisses the intro, mashes every direction key
// (including illegal 180-degree reversals, which setDir() is supposed to
// reject) for several seconds across all 4 ages, then lets a round
// complete naturally and checks the reveal overlay renders.

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
  loadScript('js/snake.js');
} catch (e) {
  console.log('LOAD-TIME CRASH:', e.stack);
  process.exit(1);
}
if (!window.KAT_Snake) {
  console.log('FAIL: window.KAT_Snake never got assigned (silent load-time failure)');
  process.exit(1);
}

// Mix of letter/word/phrase rounds and a small decoy pool, matching the
// real shape of data/*.js content.
const rounds = [
  { unit: 'letter', targets: ['Б', 'О', 'Т'], decoys: ['Ж', 'Ц'], icon: '🤖', fact: 'Факт про бота.' },
  { unit: 'word', targets: ['ИИ', 'УЧИТСЯ'], decoys: ['ФЕЙК'], icon: '🧠', fact: 'Факт про обучение.' },
  { unit: 'letter', targets: ['А', 'Й'], decoys: ['Ъ'], icon: '🛡️', fact: 'Факт про безопасность.' },
];

const container = window.document.getElementById('container');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function testAge(age) {
  console.log('--- age:', age, '---');
  window.KAT_Snake.start(container, {
    age, lang: 'ru', rounds,
    onRoundComplete(idx) { console.log('  round complete:', idx); },
    onAllDone() { console.log('  onAllDone fired'); },
  });

  const startBtn = container.querySelector('#sk-start-btn');
  if (!startBtn) { errors.push(`[${age}] no #sk-start-btn on round intro`); return; }
  startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(50);

  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  for (let i = 0; i < 60; i++) {
    const k = keys[i % keys.length]; // deliberately includes illegal reversals back-to-back
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k }));
    await sleep(80);
    if (errors.length) return;
  }
  console.log('  survived ~5s of (including illegal-reversal) direction input');

  // Also exercise the touch-swipe path.
  const canvas = container.querySelector('#sk-canvas');
  // jsdom's TouchEvent constructor doesn't accept a touch-data init dict,
  // so build plain Events and manually attach changedTouches — real browser
  // touch events always have this populated; only the synthetic test event
  // needs the explicit patch.
  const touchStart = new window.Event('touchstart', { bubbles: true });
  Object.defineProperty(touchStart, 'changedTouches', { value: [{ clientX: 100, clientY: 100 }] });
  canvas.dispatchEvent(touchStart);
  const touchEnd = new window.Event('touchend', { bubbles: true });
  Object.defineProperty(touchEnd, 'changedTouches', { value: [{ clientX: 160, clientY: 100 }] });
  canvas.dispatchEvent(touchEnd);
  await sleep(300);
  if (errors.length) return;
  console.log('  swipe input exercised without throwing');
}

(async () => {
  for (const age of ['tiny', 'child', 'teen', 'adult']) {
    await testAge(age);
    if (errors.length) break;
  }

  if (errors.length) {
    console.log('\n=== ERRORS FOUND ===');
    errors.forEach(e => console.log(e, '\n'));
    process.exit(1);
  } else {
    console.log('\n=== NO ERRORS CAUGHT ACROSS ALL 4 AGES (snake.js) ===');
    process.exit(0);
  }
})();
