/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · island/robot.js
   The explorer robot — original design, built from procedural geometry
   (no external model): white ceramic body, blue joints, teal visor and
   details, orange backpack. Animation is procedural (a small hierarchy of
   groups = a simple rig): idle breathing, walk cycle, interact reach,
   "oops" head-shake on a mistake, happy hop on success.
═══════════════════════════════════════════════════════════════════ */

import * as THREE from '../vendor/three/three.module.min.js';

const C = { ceramic: 0xf4f1ea, joint: 0x2f5fd0, teal: 0x23b5b0, orange: 0xf08a24, visor: 0x123a46, eye: 0x9ff7ef };

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.05, ...opts });
}

function capsule(r, len, m) {
  const g = new THREE.CapsuleGeometry(r, len, 6, 14);
  const mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true;
  return mesh;
}
function sphere(r, m, w = 18) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, w, Math.round(w * 0.7)), m);
  mesh.castShadow = true;
  return mesh;
}

export function createRobot() {
  const M = {
    ceramic: mat(C.ceramic, { roughness: 0.32 }),
    joint: mat(C.joint, { roughness: 0.45 }),
    teal: mat(C.teal, { roughness: 0.35 }),
    orange: mat(C.orange, { roughness: 0.5 }),
    visor: mat(C.visor, { roughness: 0.15, metalness: 0.2 }),
    eye: new THREE.MeshStandardMaterial({ color: C.eye, emissive: C.eye, emissiveIntensity: 1.4 }),
  };

  const root = new THREE.Group();           // position / facing (y-rotation)
  const body = new THREE.Group();           // bob, lean
  root.add(body);

  // torso: rounded ceramic shell with a teal chest light
  const torso = capsule(0.32, 0.32, M.ceramic);
  torso.scale.set(1, 1, 0.82);
  torso.position.y = 0.95;
  body.add(torso);
  const chest = sphere(0.07, M.eye, 12);
  chest.position.set(0, 1.0, 0.27);
  body.add(chest);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 24), M.teal);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.78;
  belt.scale.set(1, 0.82, 1);
  body.add(belt);

  // backpack (orange) with a teal strap light
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.2, 2, 2, 2), M.orange);
  pack.position.set(0, 1.0, -0.33);
  pack.castShadow = true;
  body.add(pack);
  const packLight = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.02), M.teal);
  packLight.position.set(0, 1.12, -0.44);
  body.add(packLight);

  // head on a blue neck joint
  const neck = new THREE.Group();
  neck.position.y = 1.38;
  body.add(neck);
  neck.add(sphere(0.09, M.joint, 12));
  const head = new THREE.Group();
  head.position.y = 0.26;
  neck.add(head);
  const skull = sphere(0.3, M.ceramic, 24);
  skull.scale.set(1.12, 0.9, 1);
  head.add(skull);
  const visor = sphere(0.24, M.visor, 24);
  visor.scale.set(1.15, 0.62, 0.55);
  visor.position.set(0, 0.0, 0.17);
  head.add(visor);
  const eyes = [];
  for (const x of [-0.09, 0.09]) {
    const e = sphere(0.045, M.eye, 10);
    e.scale.set(1, 1.25, 0.5);
    e.position.set(x, 0.01, 0.3);
    head.add(e);
    eyes.push(e);
  }
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6), M.joint);
  antenna.position.set(0.12, 0.3, -0.02);
  head.add(antenna);
  const tip = sphere(0.04, new THREE.MeshStandardMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.6, roughness: 0.35 }), 10);
  tip.position.set(0.12, 0.4, -0.02);
  head.add(tip);

  // arms: shoulder joint → upper arm → elbow → forearm → hand
  function arm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.4 * side, 1.18, 0);
    body.add(shoulder);
    shoulder.add(sphere(0.085, M.joint, 12));
    const upper = capsule(0.07, 0.2, M.ceramic);
    upper.position.y = -0.18;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.34;
    shoulder.add(elbow);
    elbow.add(sphere(0.07, M.joint, 10));
    const fore = capsule(0.065, 0.16, M.ceramic);
    fore.position.y = -0.15;
    elbow.add(fore);
    const hand = sphere(0.085, M.teal, 12);
    hand.position.y = -0.3;
    elbow.add(hand);
    return { shoulder, elbow };
  }
  const armL = arm(1), armR = arm(-1);

  // legs: hip joint → leg → foot
  function leg(side) {
    const hip = new THREE.Group();
    hip.position.set(0.16 * side, 0.62, 0);
    body.add(hip);
    hip.add(sphere(0.085, M.joint, 12));
    const shin = capsule(0.085, 0.24, M.ceramic);
    shin.position.y = -0.22;
    hip.add(shin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.09, 0.26, 2, 1, 2), M.joint);
    foot.position.set(0, -0.46, 0.04);
    foot.castShadow = true;
    hip.add(foot);
    return hip;
  }
  const legL = leg(1), legR = leg(-1);

  // soft contact shadow (blob) under the feet — reads well even where the
  // shadow map is coarse or disabled on weak devices
  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 24),
    new THREE.MeshBasicMaterial({ color: 0x1b2a33, transparent: true, opacity: 0.28, depthWrite: false }),
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.015;
  root.add(blob);

  // ── animation state ──
  const st = { walk: 0, speed: 0, mood: 'idle', moodT: 0, reach: 0 };
  root.userData.robot = st;

  // mood: 'idle' | 'interact' | 'oops' | 'happy'
  function setMood(m) { st.mood = m; st.moodT = 0; }

  function update(dt, t, speed) {
    st.speed += (speed - st.speed) * Math.min(1, dt * 10);   // smooth start/stop
    const k = Math.min(1, st.speed / 3.2);                      // 0 idle … 1 full walk
    st.walk += dt * (2 + 7 * k);
    const s = Math.sin(st.walk), c = Math.cos(st.walk);

    // walk cycle blended with idle breathing
    legL.rotation.x = s * 0.6 * k;
    legR.rotation.x = -s * 0.6 * k;
    armL.shoulder.rotation.x = -s * 0.55 * k;
    armR.shoulder.rotation.x = s * 0.55 * k;
    armL.elbow.rotation.x = armR.elbow.rotation.x = -0.25 - 0.2 * k;
    body.position.y = Math.abs(c) * 0.06 * k + Math.sin(t * 2) * 0.012 * (1 - k);
    body.rotation.x = 0.08 * k;                               // lean into the walk
    armL.shoulder.rotation.z = 0.12; armR.shoulder.rotation.z = -0.12;
    head.rotation.set(0, 0, 0);

    // moods (short, then back to idle)
    st.moodT += dt;
    if (st.mood === 'interact') {
      const r = Math.sin(Math.min(1, st.moodT / 0.6) * Math.PI);
      armR.shoulder.rotation.x = -1.4 * r;
      armR.elbow.rotation.x = -0.2;
      head.rotation.x = 0.25 * r;
      if (st.moodT > 0.6) setMood('idle');
    } else if (st.mood === 'oops') {
      head.rotation.y = Math.sin(st.moodT * 18) * 0.35 * Math.max(0, 1 - st.moodT / 1.1);
      head.rotation.z = 0.15;
      body.rotation.x = -0.06;
      armL.shoulder.rotation.z = 0.5; armR.shoulder.rotation.z = -0.5;
      eyes.forEach((e) => { e.scale.y = 0.6; });
      if (st.moodT > 1.1) { eyes.forEach((e) => { e.scale.y = 1.25; }); setMood('idle'); }
    } else if (st.mood === 'happy') {
      const h = Math.max(0, Math.sin(st.moodT * 9)) * Math.max(0, 1 - st.moodT / 1.2);
      body.position.y += h * 0.22;
      armL.shoulder.rotation.x = armR.shoulder.rotation.x = -2.6 * Math.min(1, st.moodT * 4) * (1 - Math.max(0, st.moodT - 0.9) / 0.3);
      if (st.moodT > 1.2) setMood('idle');
    }
    // blink every few seconds
    const blink = (t % 4.3) < 0.12 && st.mood !== 'oops';
    eyes.forEach((e) => { if (st.mood !== 'oops') e.scale.y = blink ? 0.15 : 1.25; });
    tip.material.emissiveIntensity = 0.4 + 0.4 * Math.sin(t * 3);
  }

  return { root, update, setMood };
}
