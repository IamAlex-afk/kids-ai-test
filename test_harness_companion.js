'use strict';
// Execution smoke test for js/companion.js — mounts the widget, drives
// addKnowledge() through every growth stage (checking the level-up toast
// path each time), lets a few animation frames run, and pokes the canvas.

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

const container = window.document.getElementById('container');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const handle = window.KAT_Companion.render(container, 'ru');
  await sleep(100);
  if (errors.length) { report(); return; }
  console.log('widget mounted, canvas animating without throwing');

  // Poke it (pointerdown interaction).
  const canvas = container.querySelector('.kat-companion-canvas');
  canvas.dispatchEvent(new window.Event('pointerdown', { bubbles: true }));
  await sleep(50);
  if (errors.length) { report(); return; }
  console.log('poke interaction survived');

  // Drive knowledge up through every stage boundary (0,5,15,35,70) and a
  // bit past the max, watching for the level-up toast each time.
  const milestones = [4, 5, 14, 15, 34, 35, 69, 70, 100];
  let prev = 0;
  for (const target of milestones) {
    const { knowledge, stage, leveledUp } = window.KAT_Companion.addKnowledge(target - prev, 'ru');
    prev = target;
    console.log(`  knowledge=${knowledge} stage=${stage} leveledUp=${leveledUp}`);
    if (errors.length) { report(); return; }
  }

  await sleep(3000); // let the level-up toast's own timeout fire
  if (errors.length) { report(); return; }

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
