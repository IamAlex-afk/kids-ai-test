/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · island/main.js
   3D level "Island of Examples" (beta). Loaded only by island/index.html.

   Loop: explore → choose examples → see the program's prediction → test
   → fix the examples → see the result change. The answers come from
   island/model.js (1-nearest-neighbour on two scaled numbers), never from
   which button was pressed.

   Privacy: nothing is sent anywhere. The only thing stored is "level
   finished", through the site's storage choice (js/storage.js).
   Robustness: no WebGL / lost context → the same task as a text version;
   pause on hidden tab; everything is disposed on exit.
═══════════════════════════════════════════════════════════════════ */

import * as THREE from '../vendor/three/three.module.min.js';
import { LEVEL } from './model.js';
import { createGame, countKinds, enough, isGarden2, toggleExample, testGate, runCheck, finish as finishGame } from './logic.js';
import { buildWorld, walkable, plantMesh, labelTag, ring } from './world.js';
import { createRobot } from './robot.js';
import { createUI } from './ui.js';

const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const SLUG = { '5-7': 'tiny', '8-10': 'child', '11-13': 'teen', '14-plus': 'adult' };
const params = new URLSearchParams(location.search);
const lang = LANGS.includes(params.get('lang')) ? params.get('lang') : 'en';
const ageKey = SLUG[params.get('age')] || 'child';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const T = (await import(`./lang/${lang}.js`)).default;
document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;

const fill = (s, v) => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in v ? v[k] : ''));
function describe(p) {
  const c = p.hue < 0.4 ? T.colourTeal : p.hue > 0.6 ? T.colourOrange : T.colourMid;
  return { kind: T[p.label], h: p.height, c, cm: T.cm };
}
function needText(g) { return fill(T.needText, g.A.need); }

/* ── settings (session only unless the user chose device saving) ── */
const settings = { calm: ageKey === 'tiny', hints: ageKey !== 'adult', low: false };

const game = createGame(ageKey);
const ui = createUI({ T, fill, game, settings, ageKey, lang, describe, needText, countKinds, onAction: () => act(), onPause: (p) => setPaused(p), onExit: exit, onRestart: restart, onText: () => startText(), on3d: () => location.reload(), onSettings: applySettings });

/* ── 3D ── */
let renderer, scene, camera, robot, world, raf = 0, paused = false, running = false;
const interact = [];               // { kind, id, pos, ring, obj, plant? }
const keys = new Set();
const dir = { x: 0, z: 0 };
let fpsT = 0, fpsN = 0, lowSwitched = false;
const cleanups = [];
const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); cleanups.push(() => target.removeEventListener(ev, fn, opt)); };

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (_) { return false; }
}

function start3D() {
  const canvasBox = document.getElementById('island-stage');
  const quality = { shadows: !settings.low, shadowSize: settings.low ? 512 : 1024 };
  renderer = new THREE.WebGLRenderer({ antialias: !settings.low, powerPreference: 'default' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.low ? 1 : 1.75));
  renderer.shadowMap.enabled = quality.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');   // the HUD carries the same information as text
  canvasBox.appendChild(renderer.domElement);

  listen(renderer.domElement, 'webglcontextlost', (e) => { e.preventDefault(); setPaused(true); ui.lost(); });

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
  world = buildWorld(scene, quality);
  robot = createRobot();
  robot.root.position.set(0, 0, 12.6);
  robot.root.rotation.y = Math.PI;
  scene.add(robot.root);

  // plants: gardens 1 and 2 (examples), the gate plant, check plants
  const place = (p, x, z, kind) => {
    const m = plantMesh(p);
    m.position.set(x, 0, z);
    scene.add(m);
    const tag = labelTag(p.label);
    tag.position.set(x + 0.45, 0, z + 0.25);
    if (kind === 'plant') scene.add(tag);          // only examples carry the botanist's tag
    const r = ring(0.62);
    r.position.set(x, 0.05, z);
    scene.add(r);
    interact.push({ kind, id: p.id, pos: new THREE.Vector3(x, 0, z), ring: r, obj: m, plant: p });
    world.walk.obstacles.push([x, z, 0.32]);       // the pot is solid, like it looks
  };
  game.A.garden1.forEach((p, i) => place(p, -5.6 - (i % 3) * 1.45, 1.6 + Math.floor(i / 3) * 1.9, 'plant'));
  game.A.garden2.forEach((p, i) => place(p, -4.6 + i * 1.9, -10 + (i % 2) * 0.8, 'plant'));
  const gp = plantMesh(LEVEL.gate);
  gp.position.set(8.4, 0.5, 0);
  scene.add(gp);
  interact.push({ kind: 'gate', id: 'gate', pos: new THREE.Vector3(8.4, 0, 0), ring: ring(0.95), obj: gp, plant: LEVEL.gate });
  game.A.check.forEach((p, i) => {
    const x = 13.8 + i * 0.95, z = 3.0;
    const m = plantMesh(p);
    m.position.set(x, 0, z);
    scene.add(m);
    interact.push({ kind: 'checkPlant', id: p.id, pos: new THREE.Vector3(x, 0, z), ring: ring(0.4), obj: m, plant: p });
    world.walk.obstacles.push([x, z, 0.32]);
  });
  interact.push({ kind: 'lab', id: 'lab', pos: new THREE.Vector3(0, 0, -0.1), ring: ring(1.1) });
  interact.push({ kind: 'station', id: 'station', pos: new THREE.Vector3(16, 0, -1.6), ring: ring(1.0) });
  interact.push({ kind: 'finale', id: 'finale', pos: new THREE.Vector3(17.6, 0, 1.8), ring: ring(1.0, 0xffc061) });
  interact.forEach((it) => { if (!it.ring.parent) { it.ring.position.set(it.pos.x, 0.05, it.pos.z); scene.add(it.ring); } });

  // prediction marker: a line to the nearest example + a sign over the gate
  predictionLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineDashedMaterial({ color: 0xff7a3d, dashSize: 0.3, gapSize: 0.18 }));
  predictionLine.visible = false;
  scene.add(predictionLine);

  window.__island = { renderer, scene, camera, game };   // for the debug overlay and screenshots only

  listen(window, 'resize', resize);
  resize();
  bindInput();
  running = true;
  ui.ready3d();
  ui.update();
  loop();
}
let predictionLine, gateSign = null;

function resize() {
  if (!renderer) return;
  const box = renderer.domElement.parentElement;
  const w = box.clientWidth, h = box.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.fov = camera.aspect < 0.8 ? 60 : 48;        // portrait phones: see more
  camera.updateProjectionMatrix();
}

/* ── input: keyboard + on-screen buttons (pointer and keyboard focusable) ── */
const KEYMAP = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
function bindInput() {
  listen(window, 'keydown', (e) => {
    if (ui.modalOpen()) return;
    if (e.code === 'Escape') { setPaused(!paused); return; }
    if (paused) return;
    if (KEYMAP[e.code]) { keys.add(e.code); e.preventDefault(); }
    if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !e.target.closest?.('button, a, input')) { e.preventDefault(); act(); }
  });
  listen(window, 'keyup', (e) => keys.delete(e.code));
  listen(window, 'blur', () => { keys.clear(); dir.x = dir.z = 0; });
  listen(document, 'visibilitychange', () => { if (document.hidden) setPaused(true); });
  ui.bindPad((x, z) => { dir.x = x; dir.z = z; });
}

function inputVector() {
  let x = dir.x, z = dir.z;
  for (const k of keys) { x += KEYMAP[k][0]; z += KEYMAP[k][1]; }
  const l = Math.hypot(x, z);
  return l > 0 ? { x: x / l, z: z / l } : { x: 0, z: 0 };
}

/* ── loop ── */
const clock = new THREE.Clock();
let nearest = null, camPos = new THREE.Vector3(0, 8, 21);
function loop() {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  if (!paused) step(dt, t);
  renderer.render(scene, camera);
  watchFps(dt);
}

function step(dt, t) {
  // movement
  const v = inputVector();
  const speed = settings.calm ? 2.3 : 3.4;
  let moving = 0;
  if (v.x || v.z) {
    const p = robot.root.position;
    const nx = p.x + v.x * speed * dt, nz = p.z + v.z * speed * dt;
    const ok = walkable(world.walk, nx, nz) || walkable(world.walk, nx, p.z) || walkable(world.walk, p.x, nz);
    if (ok) { p.x = ok.x; p.z = ok.z; moving = speed; }
    const target = Math.atan2(v.x, v.z);
    let d = target - robot.root.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    robot.root.rotation.y += d * Math.min(1, dt * 10);
  }
  robot.update(dt, t, moving);

  // camera: behind-above, smooth; no sway with reduced motion
  const p = robot.root.position;
  const want = new THREE.Vector3(p.x, 7.6, p.z + 8.8);
  camPos.lerp(want, reduceMotion ? 1 : Math.min(1, dt * 4));
  camera.position.copy(camPos);
  camera.lookAt(p.x, 1.0, p.z - 1.2);

  // stage progress by position
  if (game.stage === 'arrive' && p.z < 5) { game.stage = 'collect'; ui.update(); }

  // nearest interactive object
  const reach = settings.calm ? 2.2 : 1.6;
  let best = null, bd = Infinity;
  for (const it of interact) {
    const d = Math.hypot(it.pos.x - p.x, it.pos.z - p.z);
    if (d < reach + (it.kind === 'lab' ? 1.2 : 0) && d < bd) { best = it; bd = d; }
  }
  if (best !== nearest) { nearest = best; ui.near(best ? nearLabel(best) : null); }

  // rings: chosen examples stay lit (green), the nearest pulses (teal)
  for (const it of interact) {
    const chosen = it.kind === 'plant' && game.examples.some((e) => e.id === it.id);
    const target = it === nearest ? 0.55 + 0.35 * Math.sin(t * 6) * (reduceMotion ? 0 : 1) : chosen ? 0.75 : 0;
    it.ring.material.opacity += (target - it.ring.material.opacity) * Math.min(1, dt * 8);
    it.ring.material.color.setHex(chosen && it !== nearest ? 0x5ad16a : 0x35e0d0);
  }

  // bridge / hedge animations follow the state
  const bx = world.bridge.scale.x, bt = game.bridgeOpen ? 1 : 0.001;
  if (Math.abs(bx - bt) > 0.001) {
    world.bridge.scale.x = reduceMotion ? bt : bx + (bt - bx) * Math.min(1, dt * 2.5);
    world.bridge.position.x = 10.2 * (1 - world.bridge.scale.x);
  }
  world.walk.bridgeOpen = game.bridgeOpen && world.bridge.scale.x > 0.95;
  world.walk.garden2Open = game.garden2Open;
  world.barrier.visible = !game.garden2Open;
  world.gatePed.userData.glow.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 3);
}

function nearLabel(it) {
  const k = it.kind;
  if (k === 'plant') {
    const locked = isGarden2(game, it.id) && !game.garden2Open;
    if (locked) return { text: T.near.locked, plant: it.plant };
    return { text: game.examples.some((e) => e.id === it.id) ? T.near.remove : T.near.add, plant: it.plant, tag: true };
  }
  if (k === 'checkPlant') return { text: T.near.checkPlant, plant: it.plant };
  if (k === 'gate') return { text: T.near.gate, plant: it.plant };
  if (k === 'station') return { text: game.bridgeOpen ? T.near.station : T.near.locked };
  if (k === 'finale') return { text: game.stage === 'finale' || game.done ? T.near.finale : T.near.locked };
  return { text: T.near.lab };
}

/* ── the action button / key ── */
function act() {
  if (paused) return;
  const it = nearest;
  if (!it) return;
  robot?.setMood('interact');
  if (it.kind === 'lab') { ui.say(T.labIntro + (settings.hints ? ' ' + T.controlsHelp : '')); return; }
  if (it.kind === 'plant') {
    const r = toggleExample(game, it.plant);
    if (r === 'locked') { ui.say(T.near.locked); return; }
    ui.say(r === 'added' ? fill(T.added, describe(it.plant)) : T.removed);
    ui.update(); nearest = null;
    return;
  }
  if (it.kind === 'checkPlant') { ui.say(T.near.checkPlant); return; }
  if (it.kind === 'gate') {
    if (!enough(game)) { ui.say(fill(T.notEnough, { need: needText(game) })); return; }
    if (game.A.guessFirst && game.gateTries === 0 && game.guess === null) {
      ui.askGuess((g) => { game.guess = g; ui.say(fill(T.guessThanks, { guess: T[g] })); doGate(); });
      return;
    }
    doGate();
    return;
  }
  if (it.kind === 'station') {
    if (!game.bridgeOpen) { ui.say(T.near.locked); return; }
    const out = runCheck(game);
    ui.showCheck(out);
    robot.setMood(out.res.right === out.res.total ? 'happy' : 'oops');
    ui.update();
    return;
  }
  if (it.kind === 'finale') {
    if (game.stage !== 'finale' && !game.done) { ui.say(T.near.locked); return; }
    finish();
  }
}

function doGate() {
  const prevWrongWithMore = game.gateTries > 0 && !game.bridgeOpen;
  const out = testGate(game);
  const n = out.r.nearest;
  const msg = [fill(T.said, { kind: T[out.r.label] }), fill(T.why, { near: T[n.label], ...describe(n) })];
  if (out.right) msg.push(T.rightGate, game.A.check.length ? T.bridgeOpen : '');
  else msg.push(prevWrongWithMore ? T.sameMore : T.wrongGate, prevWrongWithMore ? '' : T.garden2Open);
  ui.say(msg.filter(Boolean).join(' '));
  robot.setMood(out.right ? 'happy' : 'oops');
  // show the nearest example the decision came from
  const from = interact.find((i) => i.id === n.id);
  if (from && predictionLine) {
    predictionLine.geometry.setFromPoints([new THREE.Vector3(8.4, 1.6, 0), new THREE.Vector3(from.pos.x, 1.2, from.pos.z)]);
    predictionLine.computeLineDistances();
    predictionLine.visible = true;
  }
  if (gateSign) scene.remove(gateSign);
  gateSign = labelTag(out.r.label);
  gateSign.scale.setScalar(1.6);
  gateSign.position.set(8.4, 1.8, 0);
  scene.add(gateSign);
  if (!game.A.check.length && out.right) game.stage = 'finale';
  ui.update();
}

// Only "finished" is stored, through the site's storage choice (tab memory
// unless the family switched device saving on). Nothing else is kept.
function saveDone() { try { window.KAT_Store?.writeJSON('kat_island_v1', { done: true, age: ageKey }); } catch (_) {} }
function finish() {
  if (!finishGame(game) && !game.done) return;
  saveDone();
  ui.finale(game);
  robot?.setMood('happy');
}

function setPaused(p) {
  paused = p;
  keys.clear(); dir.x = dir.z = 0;
  ui.paused(p);
  clock.getDelta();                    // no time jump after a pause
}

function watchFps(dt) {
  fpsT += dt; fpsN++;
  if (fpsT < 3) return;
  const fps = fpsN / fpsT;
  fpsT = 0; fpsN = 0;
  ui.fps(fps);
  if (!lowSwitched && !settings.low && fps < 24 && running && !paused) {
    lowSwitched = true;
    settings.low = true;
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    world.sun.castShadow = false;
    scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
    ui.say(T.autoLow);
  }
}

function applySettings() {
  if (!renderer) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.low ? 1 : 1.75));
  renderer.shadowMap.enabled = !settings.low;
  world.sun.castShadow = !settings.low;
  scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  resize();
}

/* ── leaving: free GPU memory, listeners and the loop ── */
function dispose() {
  cancelAnimationFrame(raf); raf = 0; running = false;
  cleanups.splice(0).forEach((f) => f());
  if (scene) scene.traverse((o) => {
    o.geometry?.dispose?.();
    const m = o.material;
    (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => x.dispose?.());
  });
  renderer?.dispose();
  renderer?.forceContextLoss?.();
  renderer?.domElement.remove();
  renderer = scene = null;
}
function exit() { dispose(); location.href = ui.backHref(); }
function restart() { dispose(); location.reload(); }

function startText() {
  dispose();
  ui.textVersion({ game, toggleExample, testGate, runCheck, enough, finish: () => { if (finishGame(game)) saveDone(); } });
}

listen(window, 'pagehide', dispose);

/* ── screenshot states for CI previews (?shot=…). They drive the same game
   functions a player would trigger; nothing here changes the rules. ── */
function placeRobot(x, z, face) { robot.root.position.set(x, 0, z); robot.root.rotation.y = face; camPos.set(x, 7.6, z + 8.8); }
function applyShot(name) {
  const g1 = game.A.garden1, g2 = game.A.garden2;
  const pick = (list, label, n) => list.filter((p) => p.label === label).slice(0, n).forEach((p) => toggleExample(game, p));
  if (name === 'start') return;
  pick(g1, 'water', game.A.need.water); pick(g1, 'desert', game.A.need.desert);
  while (!enough(game)) { const p = g1.find((x) => !game.examples.includes(x)); if (!p) break; toggleExample(game, p); }
  if (name === 'garden') { placeRobot(-6.4, 4.6, Math.PI); ui.update(); return; }
  placeRobot(7.0, 0.6, Math.PI / 2);
  nearest = interact.find((i) => i.kind === 'gate');
  game.guess = 'water';
  doGate();
  if (name === 'gate') return;
  const fix = g2.find((h) => h.label === 'water' && h.height < 40);
  const varied = g2.find((h) => h.label === 'desert' && h.height > 60);
  [fix, varied].filter(Boolean).forEach((p) => toggleExample(game, p));
  doGate();
  if (name === 'bridge') { placeRobot(9.6, 0.9, Math.PI / 2); return; }
  world.bridge.scale.x = 1; world.bridge.position.x = 0;
  placeRobot(15.2, 0.6, Math.PI);
  nearest = interact.find((i) => i.kind === 'station');
  if (game.A.check.length) { const out = runCheck(game); ui.showCheck(out); }
  if (name === 'finale') { finish(); }
}

if (params.get('mode') === 'text' || !webglAvailable()) {
  if (!webglAvailable()) ui.say(T.noWebgl);
  startText();
} else {
  try {
    start3D();
    if (params.get('shot')) applyShot(params.get('shot'));
  } catch (e) { console.error(e); ui.say(T.noWebgl); startText(); }
}
