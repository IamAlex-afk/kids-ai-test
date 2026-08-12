'use strict';
// Execution smoke test — actually RUNS the platformer in a simulated DOM
// (jsdom) instead of only checking syntax. For each age: picks the first
// world, hits Start, then lets real wall-clock time pass so the actual
// requestAnimationFrame-driven loop runs for real — first with NO jump
// input (to force real obstacle collisions -> takeHit -> checkpoint
// respawn, the exact path that crashed before), then mashing jump/dash/
// slide to exercise the rest. Any thrown error is caught and reported
// with a full stack.

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
    fillText: noop, strokeText: noop, drawImage: noop, createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    measureText: (s) => ({ width: (s || '').length * 8 }),
    set fillStyle(v) {}, get fillStyle() { return '#000'; },
    set strokeStyle(v) {}, get strokeStyle() { return '#000'; },
    set font(v) { this._font = v; }, get font() { return this._font || '10px sans-serif'; },
    set lineWidth(v) {}, set lineCap(v) {}, set textAlign(v) {}, set textBaseline(v) {},
    set globalAlpha(v) {}, set shadowBlur(v) {}, set shadowColor(v) {},
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
  loadScript('js/platformer.js');
} catch (e) {
  console.log('LOAD-TIME CRASH:', e.stack);
  process.exit(1);
}
if (!window.KAT_Platformer || !window.KAT_Leaderboard) {
  console.log('FAIL: window.KAT_Platformer / window.KAT_Leaderboard never assigned (silent load-time failure)');
  process.exit(1);
}

const lessons = [
  { icon: '🤖', title: 'Что такое ИИ?', text: 'Короткое вступление про ИИ для теста.' },
  { icon: '🧠', title: 'Как ИИ учится', text: 'Ещё одно вступление подлиннее, чтобы проверить перенос строк в карточке урока и не выйти за рамки.' },
  { icon: '🛡️', title: 'Безопасность', text: 'Третий урок.' },
  { icon: '🔬', title: 'Ограничения ИИ', text: 'Четвёртый урок.' },
];
const rounds = [
  { unit: 'letter', targets: ['Б', 'О', 'Т'], decoys: ['Ж'], icon: '🤖', fact: 'Факт про бота.' },
  { unit: 'word', targets: ['ИИ', 'УЧИТСЯ'], decoys: [], icon: '🧠', fact: 'Факт про обучение.' },
  { unit: 'letter', targets: ['А', 'Й'], decoys: [], icon: '🛡️', fact: 'Факт про безопасность.' },
  { unit: 'phrase', targets: ['НЕ', 'ВСЕГДА', 'ПРАВ'], decoys: [], icon: '🔬', fact: 'Факт про ограничения.' },
];
const quiz = [
  { type: 'yesno', q: 'Может ли робот чувствовать грусть?', correct: 0, explanation: 'Нет, роботы не чувствуют.' },
  { type: 'yesno', q: 'Можешь ли ты быть умнее ИИ?', correct: 1, explanation: 'Да, у тебя есть настоящее творчество.' },
];
const protocols = [
  { num: 1, icon: '🤔', title: 'Спроси взрослого', text: 'Если ИИ сказал что-то удивительное — проверь с мамой или папой.' },
  { num: 2, icon: '🛑', title: 'Можно сказать НЕТ', text: 'Тебе не нужно слушаться робота.' },
];

const container = window.document.getElementById('container');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function testAge(age) {
  console.log('--- age:', age, '---');
  window.KAT_Platformer.startWorldSelect(container, {
    age, lang: 'ru', lessons, rounds, quiz, protocols,
    onAllDone() { console.log('  onAllDone fired'); },
  });

  const cards = container.querySelectorAll('.pf-world-card');
  console.log('  world cards rendered:', cards.length);
  if (!cards.length) { errors.push(`[${age}] no world cards rendered`); return; }

  cards[0].dispatchEvent(new window.Event('click', { bubbles: true }));

  const startBtn = container.querySelector('#pf-start-btn');
  if (!startBtn) { errors.push(`[${age}] no #pf-start-btn after picking a world`); return; }
  startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));

  // Phase 1: don't jump at all for 3s — guarantees the player walks into
  // ground obstacles (forces takeHit -> parts-loss -> eventually the
  // checkpoint-respawn path, the exact code that crashed before).
  await sleep(3000);
  if (errors.length) return;
  console.log('  survived 3s with zero input (forced hits)');

  // Phase 2: mash jump/dash/slide for another 4s.
  const jumpEvt = () => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowUp' }));
  const dashEvt = () => { window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Shift' })); window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: ' ' })); window.document.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'Shift' })); };
  const slideDown = () => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown' }));
  const slideUp = () => window.document.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'ArrowDown' }));
  for (let i = 0; i < 40; i++) {
    jumpEvt();
    if (i % 5 === 0) dashEvt();
    if (i % 7 === 0) { slideDown(); await sleep(30); slideUp(); }
    await sleep(100);
    if (errors.length) return;
  }
  console.log('  survived 4s of jump/dash/slide input');

  // Phase 3: try the exit button (if present) to exercise finishRun('exit').
  const exitBtn = container.querySelector('#pf-exit');
  if (exitBtn) {
    exitBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    await sleep(200);
    console.log('  exit button exercised');
  }
}

async function testWinPath() {
  console.log('--- forced win path (tiny, 1-letter world) ---');
  const tinyLessons = [{ icon: '🤖', title: 'Тест', text: 'Мини-мир для проверки победы.' }];
  const tinyRounds = [{ unit: 'letter', targets: ['А'], decoys: [], icon: '🤖', fact: 'Единственная буква мира.' }];
  window.KAT_Platformer.startWorldSelect(container, {
    age: 'tiny', lang: 'ru', lessons: tinyLessons, rounds: tinyRounds,
    onAllDone() { console.log('  onAllDone fired'); },
  });
  const cards = container.querySelectorAll('.pf-world-card');
  if (!cards.length) { errors.push('[win-path] no world cards for 1-letter world'); return; }
  cards[0].dispatchEvent(new window.Event('click', { bubbles: true }));
  const startBtn = container.querySelector('#pf-start-btn');
  if (!startBtn) { errors.push('[win-path] no start button'); return; }
  startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));

  // One letter, seeded immediately at start — should be collected within
  // a second or two just from the auto-runner's own forward motion.
  await sleep(4000);
  if (errors.length) return;

  const overlay = container.querySelector('#pf-overlay');
  const overlayVisible = overlay && !overlay.classList.contains('hidden');
  const scoreBox = container.querySelector('.game-score-num');
  console.log('  after 4s: overlay visible =', overlayVisible, ', score element present =', !!scoreBox);
  if (!overlayVisible) { errors.push('[win-path] world-clear overlay never appeared after 4s on a 1-letter world — win path may not be firing'); return; }

  const againBtn = container.querySelector('#pf-again-btn');
  const backBtn = container.querySelector('#pf-back-btn');
  if (!againBtn || !backBtn) { errors.push('[win-path] finish overlay missing again/back buttons'); return; }
  console.log('  win overlay rendered with again/back buttons, no crash');

  backBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(200);
  console.log('  back-to-worlds exercised (should re-render with 1+ stars and unlocked skin picker if full build reached)');
}

async function testQuizPath() {
  console.log('--- quiz-at-checkpoint path (child, 4-letter world) ---');
  // Only 2 letters total: the seeded opening letter (always collected
  // within a few seconds, per the win-path test above) already crosses
  // frac=0.5 >= the 0.3 checkpoint threshold, and 1 < totalLetters(2) so
  // the win path doesn't short-circuit the quiz check.
  const soloLessons = [{ icon: '🧠', title: 'Тест викторины', text: 'Мир для проверки вопроса на чекпоинте.' }];
  const soloRounds = [
    { unit: 'letter', targets: ['А', 'Б'], decoys: [], icon: '🤖', fact: 'Факт 1.' },
  ];
  window.KAT_Platformer.startWorldSelect(container, {
    age: 'child', lang: 'ru', lessons: soloLessons, rounds: soloRounds, quiz, protocols,
    onAllDone() {},
  });
  const cards = container.querySelectorAll('.pf-world-card');
  if (!cards.length) { errors.push('[quiz-path] no world cards'); return; }
  cards[0].dispatchEvent(new window.Event('click', { bubbles: true }));
  const startBtn = container.querySelector('#pf-start-btn');
  if (!startBtn) { errors.push('[quiz-path] no start button'); return; }
  startBtn.dispatchEvent(new window.Event('click', { bubbles: true }));

  // 4 letters total; the 30% checkpoint crosses on the very first pickup
  // (1/4 = 0.25... second pickup = 0.5, crosses 0.3). Give it a few
  // seconds of real time to actually collect via the auto-runner.
  let sawQuiz = false;
  for (let i = 0; i < 60 && !sawQuiz; i++) {
    await sleep(100);
    if (errors.length) return;
    const yesBtn = container.querySelector('#pf-quiz-yes');
    if (yesBtn) sawQuiz = true;
  }
  console.log('  quiz overlay appeared at a checkpoint:', sawQuiz);
  if (!sawQuiz) { errors.push('[quiz-path] quiz overlay never appeared within 6s on a world with a full quiz pool'); return; }

  container.querySelector('#pf-quiz-yes').dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(100);
  const contBtn = container.querySelector('#pf-quiz-cont');
  if (!contBtn) { errors.push('[quiz-path] no continue button after answering the quiz'); return; }
  console.log('  answered quiz, explanation + continue button rendered without throwing');
  contBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  await sleep(2500);
  if (errors.length) return;
  console.log('  resumed after quiz without throwing');
}

(async () => {
  for (const age of ['tiny', 'child', 'teen', 'adult']) {
    await testAge(age);
    if (errors.length) break;
  }
  if (!errors.length) await testWinPath();
  if (!errors.length) await testQuizPath();

  if (errors.length) {
    console.log('\n=== ERRORS FOUND ===');
    errors.forEach(e => console.log(e, '\n'));
    process.exit(1);
  } else {
    console.log('\n=== NO ERRORS CAUGHT ACROSS ALL 4 AGES ===');
    process.exit(0);
  }
})();
