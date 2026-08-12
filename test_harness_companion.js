'use strict';
// Execution smoke test for js/companion.js (v2: distinct-accomplishment
// leveling). Mounts the widget, opens training, walks menu -> question
// list -> answer correctly -> verifies level moved -> re-answers the SAME
// question correctly again -> verifies NO further growth (the explicit
// "can't take the point twice" rule) -> exercises skip/back -> does the
// same round-trip for the article-reading path -> drives enough distinct
// accomplishments to hit every stage boundary.

const { JSDOM } = require('jsdom');
const fs = require('fs');

const errors = [];
function assert(cond, msg) { if (!cond) errors.push('ASSERTION FAILED: ' + msg); }

// Hard watchdog: a bug in this test file (not necessarily companion.js)
// should fail loudly within seconds, never hang the process indefinitely.
const watchdog = setTimeout(() => {
  console.log('\n=== WATCHDOG: test did not finish within 15s ===');
  process.exit(1);
}, 15000);
watchdog.unref?.();

const dom = new JSDOM('<!doctype html><html><body><div id="container"></div></body></html>', {
  url: 'http://localhost/ru.html',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});
const { window } = dom;

window.HTMLCanvasElement.prototype.getContext = function () {
  const noop = () => {};
  const ctx = {
    save: noop, restore: noop, translate: noop, clearRect: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, arc: noop, arcTo: noop, ellipse: noop,
    closePath: noop, fill: noop, stroke: noop, fillRect: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
    set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {}, set lineCap(v) {},
    set globalAlpha(v) {}, set shadowBlur(v) {}, set shadowColor(v) {},
  };
  return ctx;
};

window.addEventListener('error', (e) => {
  errors.push('window.onerror: ' + e.message + (e.error && e.error.stack ? '\n' + e.error.stack : ''));
});
process.on('unhandledRejection', (e) => errors.push('unhandledRejection: ' + e));
process.on('uncaughtException', (e) => errors.push('uncaughtException: ' + e.stack));

const code = fs.readFileSync('js/companion.js', 'utf8');
const el = window.document.createElement('script');
el.textContent = code;
window.document.head.appendChild(el);

if (!window.KAT_Companion) {
  console.log('FAIL: window.KAT_Companion never assigned (silent load-time failure)');
  process.exit(1);
}

const quiz = [
  { type: 'yesno', q: 'Может ли робот чувствовать грусть?', correct: 0, explanation: 'Нет, роботы не чувствуют.' },
  { type: 'yesno', q: 'Можешь ли ты быть умнее ИИ?', correct: 1, explanation: 'Да, у тебя есть настоящее творчество.' },
  { type: 'yesno', q: 'ИИ всегда прав?', correct: 0, explanation: 'Нет, ИИ может ошибаться.' },
];
const lessons = [
  { icon: '🤖', title: 'Что такое ИИ?', text: 'ИИ — это программа.' },
  { icon: '🧠', title: 'Как ИИ учится', text: 'На примерах.' },
];
window.KAT_Companion.setContent(quiz, lessons);

const container = window.document.getElementById('container');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const q = (sel) => window.document.querySelector(sel);
const click = (el) => {
  if (!el) { errors.push('click() called on a null element — see the preceding assert for which one'); return; }
  el.dispatchEvent(new window.Event('click', { bubbles: true }));
};

(async () => {
  const handle = window.KAT_Companion.render(container, 'ru');
  await sleep(80);
  if (errors.length) return report();
  console.log('widget mounted');

  click(container.querySelector('#kc-train-btn'));
  await sleep(50);
  let overlay = window.document.getElementById('kat-companion-overlay');
  assert(overlay, 'training overlay opened');
  if (errors.length) return report();

  // Menu -> question list.
  click(overlay.querySelector('#kc-go-questions'));
  await sleep(50);
  let rows = overlay.querySelectorAll('.kat-companion-list-item');
  assert(rows.length === quiz.length, `question list shows all ${quiz.length} questions (got ${rows.length})`);
  if (errors.length) return report();
  console.log('question list rendered with', rows.length, 'entries');

  // Pick the first question, answer it correctly.
  click(rows[0]);
  await sleep(50);
  const qText = overlay.querySelector('.pf-lesson-text')?.textContent || '';
  const asked = quiz.find(qq => qText.includes(qq.q));
  assert(asked, 'rendered question matches a known quiz entry: ' + qText);
  if (errors.length) return report();

  const levelBefore = window.KAT_Companion.getLevel();
  click(asked.correct === 1 ? overlay.querySelector('#kc-yes') : overlay.querySelector('#kc-no'));
  await sleep(50);
  const levelAfterFirst = window.KAT_Companion.getLevel();
  console.log(`  answered correctly: level ${levelBefore} -> ${levelAfterFirst}`);
  assert(levelAfterFirst === levelBefore + 1, `first correct answer to a NEW question should move level by exactly 1 (got ${levelBefore} -> ${levelAfterFirst})`);
  if (errors.length) return report();

  // Go back to the list, answer the SAME question correctly again — must
  // NOT grant a second point (the literal "can't double-dip" requirement).
  click(overlay.querySelector('#kc-list-btn'));
  await sleep(50);
  rows = overlay.querySelectorAll('.kat-companion-list-item');
  const knownRow = Array.from(rows).find(r => r.textContent.includes(asked.q));
  assert(knownRow && knownRow.className.includes('known'), 'the answered question is marked known (✅) in the list');
  click(knownRow);
  await sleep(50);
  click(asked.correct === 1 ? overlay.querySelector('#kc-yes') : overlay.querySelector('#kc-no'));
  await sleep(50);
  const levelAfterRepeat = window.KAT_Companion.getLevel();
  console.log(`  re-answered same question: level stayed ${levelAfterRepeat}`);
  assert(levelAfterRepeat === levelAfterFirst, `answering the SAME question again must not add another point (got ${levelAfterFirst} -> ${levelAfterRepeat})`);
  if (errors.length) return report();

  // Back to the list, exercise skip/back on a different question.
  click(overlay.querySelector('#kc-list-btn'));
  await sleep(50);
  rows = overlay.querySelectorAll('.kat-companion-list-item');
  click(rows[1]);
  await sleep(50);
  const skipBtn = overlay.querySelector('#kc-skip');
  assert(skipBtn, 'skip button present on a question');
  click(skipBtn);
  await sleep(50);
  const backBtn = overlay.querySelector('#kc-back');
  assert(backBtn, 'back button present after skipping');
  click(backBtn);
  await sleep(50);
  console.log('skip/back navigation survived without throwing');
  if (errors.length) return report();

  // #kc-back landed us back on a question-detail screen (it has no menu
  // button of its own — that only exists on the list screens) — close and
  // reopen fresh for a clean run at the article path instead of chaining
  // further history-stack assumptions.
  click(overlay.querySelector('#kc-close'));
  await sleep(50);
  assert(!window.document.getElementById('kat-companion-overlay'), 'overlay closed after skip/back sequence');
  if (errors.length) return report();
  click(container.querySelector('#kc-train-btn'));
  await sleep(50);
  overlay = window.document.getElementById('kat-companion-overlay');
  assert(overlay, 'training overlay reopened');
  if (errors.length) return report();

  click(overlay.querySelector('#kc-go-articles'));
  await sleep(50);
  rows = overlay.querySelectorAll('.kat-companion-list-item');
  assert(rows.length === lessons.length, `article list shows all ${lessons.length} articles`);
  click(rows[0]);
  await sleep(50);
  const gotItBtn = overlay.querySelector('#kc-got-it');
  assert(gotItBtn, 'got-it button present on an article');
  const levelBeforeArticle = window.KAT_Companion.getLevel();
  click(gotItBtn);
  await sleep(50);
  const levelAfterArticle = window.KAT_Companion.getLevel();
  console.log(`  read an article: level ${levelBeforeArticle} -> ${levelAfterArticle}`);
  assert(levelAfterArticle === levelBeforeArticle + 1, 'reading a new article grants exactly 1 level');
  if (errors.length) return report();

  click(overlay.querySelector('#kc-close'));
  await sleep(50);
  assert(!window.document.getElementById('kat-companion-overlay'), 'overlay closed cleanly');
  if (errors.length) return report();

  // Drive through remaining distinct accomplishments to hit max stage.
  for (let i = 0; i < 10; i++) window.KAT_Companion.recordAccomplishment('extra_' + i, 'ru');
  await sleep(50);
  console.log('  level after 10 more distinct accomplishments:', window.KAT_Companion.getLevel(), '(capped at 4)');
  assert(window.KAT_Companion.getLevel() === 4, 'level caps at the last stage index (4)');
  await sleep(3000); // let any level-up toast timers fire
  if (errors.length) return report();

  handle.destroy();
  console.log('widget destroyed cleanly');
  report();
})();

function report() {
  if (errors.length) {
    console.log('\n=== ERRORS FOUND ===');
    errors.forEach(e => console.log(e, '\n'));
    process.exit(1);
  } else {
    console.log('\n=== NO ERRORS CAUGHT (companion.js) ===');
    process.exit(0);
  }
}
