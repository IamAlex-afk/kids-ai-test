/* ═══════════════════════════════════════════════════════════════════
   KIDS AI TEST · island/world.js
   Builds the level's 3D world from procedural geometry: a light sky of
   floating islands with botanical labs. Returns meshes the game needs
   (plants, pedestals, bridge, beacons) and a simple walkable-area model.

   Layout (top view, metres; north = −z):
     dock (0, 12) → path → lab plaza (0, 2) · glass lab (0, −3)
     garden 1 west (−6.5, 3) · garden 2 behind the lab (0, −9.5, gated)
     gate pedestal east (8.4, 0) → bridge → east islet (16, 0): check station
═══════════════════════════════════════════════════════════════════ */

import * as THREE from '../vendor/three/three.module.min.js';

const COL = {
  grass: 0x8fcf6a, grassDark: 0x6fb556, rock: 0xb9a48c, rockDark: 0x8f7d68, stone: 0xe9e2d3,
  glass: 0x7fe0d8, frame: 0xf6f3ec, wood: 0xc79a6b, water: 0x2bb3c4, sand: 0xf0c27a,
  teal: 0x1fb3a7, orange: 0xf28a22, skyTop: 0x7fc6f2, skyHorizon: 0xe6f6ff, leafDark: 0x2d6e47,
};
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
const shadowy = (m, cast = true, receive = true) => { m.castShadow = cast; m.receiveShadow = receive; return m; };

// Leaf colour from the model's hue feature: 0 teal … 1 orange.
export function leafColor(hue) {
  return new THREE.Color(COL.teal).lerp(new THREE.Color(COL.orange), hue);
}

function sky(scene) {
  const g = new THREE.SphereGeometry(400, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(COL.skyTop) }, bottom: { value: new THREE.Color(COL.skyHorizon) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vP,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = clamp(normalize(vP).y*1.6+0.25,0.,1.); gl_FragColor = vec4(mix(bottom, top, h),1.); }',
  });
  scene.add(new THREE.Mesh(g, m));
  scene.fog = new THREE.Fog(COL.skyHorizon, 38, 150);
}

function lights(scene, quality) {
  scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x9a8f6a, 1.35));
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.3);
  sun.position.set(14, 22, 10);
  sun.castShadow = quality.shadows;
  sun.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 70 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  return sun;
}

// A floating island: grass top + rocky underside
function islandMesh(r, depth, x, z, y = 0) {
  const g = new THREE.Group();
  const top = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.96, 0.6, 40), std(COL.grass)), false, true);
  top.position.y = y - 0.3;
  g.add(top);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.97, r * 0.9, 0.9, 40), std(COL.rock));
  rim.position.y = y - 1.0;
  g.add(rim);
  const under = new THREE.Mesh(new THREE.ConeGeometry(r * 0.9, depth, 12, 3), std(COL.rockDark, { flatShading: true }));
  under.rotation.x = Math.PI;
  under.position.y = y - 1.45 - depth / 2;
  g.add(under);
  g.position.set(x, 0, z);
  return g;
}

function stonePath(scene, from, to, width = 1.6) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b), steps = Math.max(2, Math.round(len / 0.9));
  const m = std(COL.stone, { roughness: 0.95 });
  const geo = new THREE.CylinderGeometry(1, 1, 0.08, 7);
  for (let i = 0; i <= steps; i++) {
    const p = a.clone().lerp(b, i / steps);
    const s = shadowy(new THREE.Mesh(geo, m), false, true);
    const k = width * (0.42 + ((i * 37) % 7) / 40);
    s.scale.set(k, 1, k * 0.86);
    s.rotation.y = (i * 1.3) % Math.PI;
    s.position.set(p.x + Math.sin(i * 2.1) * 0.12, 0.03, p.z + Math.cos(i * 1.7) * 0.12);
    scene.add(s);
  }
}

function tree(x, z, s = 1) {
  const g = new THREE.Group();
  const trunk = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.2 * s, 7), std(COL.wood)));
  trunk.position.y = 0.6 * s;
  g.add(trunk);
  const leafM = std(0x5fb85a, { flatShading: true });
  [[0, 1.6, 0, 0.75], [0.35, 1.35, 0.1, 0.55], [-0.3, 1.4, -0.15, 0.5]].forEach(([dx, dy, dz, r]) => {
    const b = shadowy(new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 0), leafM));
    b.position.set(dx * s, dy * s, dz * s);
    g.add(b);
  });
  g.position.set(x, 0, z);
  return g;
}

function cloud(x, y, z, s) {
  const g = new THREE.Group();
  const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25 });
  [[0, 0, 0, 1.6], [1.6, -0.2, 0.2, 1.2], [-1.5, -0.3, 0, 1.1], [0.6, 0.6, -0.3, 1.0]].forEach(([dx, dy, dz, r]) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), m);
    b.position.set(dx, dy, dz);
    g.add(b);
  });
  g.scale.setScalar(s);
  g.position.set(x, y, z);
  return g;
}

// A plant whose stem height and leaf colour ARE the two model features.
export function plantMesh(p) {
  const g = new THREE.Group();
  const h = p.height / 100 * 1.6 + 0.2;                // 10–90 cm → 0.36–1.64 m on screen
  const stemM = std(COL.leafDark, { roughness: 0.7 });
  const stem = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, h, 6), stemM));
  stem.position.y = h / 2;
  g.add(stem);
  const leafM = std(leafColor(p.hue), { roughness: 0.55, flatShading: true });
  const leaves = Math.max(3, Math.round(h * 4));
  for (let i = 0; i < leaves; i++) {
    const leaf = shadowy(new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), leafM));
    leaf.scale.set(1, 0.35, 0.55);
    const a = i * 2.4, y = 0.25 + (i / leaves) * (h - 0.2);
    leaf.position.set(Math.cos(a) * 0.17, y, Math.sin(a) * 0.17);
    leaf.rotation.set(0.4, -a, 0.3);
    g.add(leaf);
  }
  const bud = shadowy(new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 0), leafM));
  bud.position.y = h + 0.05;
  g.add(bud);
  const pot = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.3, 14), std(0xd8cdb8)));
  pot.position.y = 0.15;
  g.add(pot);
  g.userData.top = h + 0.25;
  return g;
}

// Botanist's tag next to an example plant: blue drop (water) or orange sun (desert).
export function labelTag(label) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 6), std(COL.wood));
  post.position.y = 0.27;
  g.add(post);
  const water = label === 'water';
  const sign = new THREE.Mesh(water ? new THREE.SphereGeometry(0.13, 12, 10) : new THREE.CylinderGeometry(0.14, 0.14, 0.05, 12),
    std(water ? 0x2c8fe0 : 0xf2a33a, { emissive: water ? 0x1a5fa0 : 0xa05a10, emissiveIntensity: 0.25, roughness: 0.4 }));
  if (water) sign.scale.set(0.85, 1.15, 0.85); else sign.rotation.x = Math.PI / 2;
  sign.position.y = 0.66;
  g.add(sign);
  return g;
}

// Glowing ring under interactive objects; shown when the robot is near.
export function ring(r = 0.7, color = 0x35e0d0) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r * 0.82, r, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.0, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.05;
  return m;
}

function pavilion() {
  const g = new THREE.Group();
  const base = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.3, 8), std(COL.stone)), false, true);
  base.position.y = 0.15;
  g.add(base);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 2.6, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: COL.glass, transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = 1.6;
  g.add(glass);
  const frameM = std(COL.frame, { roughness: 0.4 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const col = shadowy(new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.7, 0.16), frameM));
    col.position.set(Math.cos(a) * 2.85, 1.6, Math.sin(a) * 2.85);
    g.add(col);
  }
  const roof = shadowy(new THREE.Mesh(new THREE.ConeGeometry(3.3, 1.5, 8), new THREE.MeshStandardMaterial({ color: COL.glass, transparent: true, opacity: 0.55, roughness: 0.1 })));
  roof.position.y = 3.65;
  roof.rotation.y = Math.PI / 8;
  g.add(roof);
  // the sorter console inside: a desk with two bins (water / desert)
  const desk = shadowy(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 0.8), std(COL.frame, { roughness: 0.5 })));
  desk.position.set(0, 0.7, -0.6);
  g.add(desk);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.75), new THREE.MeshStandardMaterial({ color: 0x0f3d45, emissive: 0x1aa59a, emissiveIntensity: 0.35 }));
  screen.position.set(0, 1.55, -0.95);
  g.add(screen);
  return { group: g, screen };
}

function pedestal(color = COL.stone) {
  const g = new THREE.Group();
  const p = shadowy(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 16), std(color, { roughness: 0.6 })));
  p.position.y = 0.25;
  g.add(p);
  const glow = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.035, 8, 32), new THREE.MeshStandardMaterial({ color: 0x35e0d0, emissive: 0x35e0d0, emissiveIntensity: 0.8 }));
  glow.rotation.x = Math.PI / 2;
  glow.position.y = 0.5;
  g.add(glow);
  g.userData.glow = glow;
  return g;
}

export function buildWorld(scene, quality) {
  sky(scene);
  const sun = lights(scene, quality);

  // islands
  scene.add(islandMesh(11, 9, 0, 0));          // main
  scene.add(islandMesh(3, 4, 0, 12.4));        // dock
  scene.add(islandMesh(5, 6, 16, 0));          // east islet (check station)
  // distant islands for depth
  [[-30, -6, -40, 6], [36, -10, -55, 8], [-48, -4, 10, 5], [40, 2, 40, 5], [-12, 8, -70, 9]].forEach(([x, y, z, r]) => {
    const isl = islandMesh(r, r * 1.2, x, z, 0);
    isl.position.y = y;
    isl.add(tree(0, 0, 1.6));
    scene.add(isl);
  });
  [[-20, 10, -20, 1.2], [24, 12, -30, 1.6], [-34, 7, 25, 1.4], [10, 15, -48, 2], [30, 6, 20, 1.1], [-6, 9, 30, 1.3]].forEach(([x, y, z, s]) => scene.add(cloud(x, y, z, s)));

  // paths
  stonePath(scene, [0, 0, 11.5], [0, 0, 3.5]);
  stonePath(scene, [-1.2, 0, 2.6], [-5.2, 0, 3]);
  stonePath(scene, [1.2, 0, 1.6], [7.2, 0, 0.2]);
  stonePath(scene, [-3.6, 0, -1.6], [-2.6, 0, -7.6]);
  stonePath(scene, [13.2, 0, 0], [15.5, 0, 0]);

  // decoration that frames, never blocks, the targets
  const TREES = [[-8.6, -4.5, 1.2], [8.2, -5.5, 1.1], [-9.2, 6.5, 0.9], [6.8, 7.6, 1], [4.6, -8.2, 0.8], [19.2, -1.2, 0.8]];
  TREES.forEach(([x, z, s]) => scene.add(tree(x, z, s)));
  const pondM = new THREE.MeshStandardMaterial({ color: COL.water, roughness: 0.15, metalness: 0.1 });
  const pond = shadowy(new THREE.Mesh(new THREE.CircleGeometry(1.4, 28), pondM), false, true);
  pond.rotation.x = -Math.PI / 2; pond.position.set(-8.4, 0.02, -1.6); scene.add(pond);
  const sand = shadowy(new THREE.Mesh(new THREE.CircleGeometry(1.5, 28), std(COL.sand)), false, true);
  sand.rotation.x = -Math.PI / 2; sand.position.set(-4.6, 0.02, 6.6); scene.add(sand);

  const lab = pavilion();
  lab.group.position.set(0, 0, -3.4);
  scene.add(lab.group);

  // gate to garden 2 (low hedge with an opening that a barrier closes)
  const barrier = shadowy(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 0.25), new THREE.MeshStandardMaterial({ color: 0x35e0d0, transparent: true, opacity: 0.55, emissive: 0x35e0d0, emissiveIntensity: 0.4 })));
  barrier.position.set(-2.4, 0.45, -7.2);
  scene.add(barrier);

  // gate pedestal + retracted bridge to the east islet
  const gatePed = pedestal();
  gatePed.position.set(8.4, 0, 0);
  scene.add(gatePed);
  const bridge = new THREE.Group();
  const plankM = std(COL.wood, { roughness: 0.8 });
  for (let i = 0; i < 8; i++) {
    const plank = shadowy(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 1.8), plankM));
    plank.position.set(10.4 + i * 0.44, -0.02, 0);
    bridge.add(plank);
  }
  const ropeM = std(0xd9c7a4);
  for (const z of [-0.9, 0.9]) {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.6, 6), ropeM);
    rope.rotation.z = Math.PI / 2; rope.position.set(11.95, 0.55, z);
    bridge.add(rope);
  }
  bridge.scale.x = 0.001;                         // retracted
  bridge.position.x = 10.2 * (1 - 0.001);
  scene.add(bridge);

  // check station on the east islet
  const station = pedestal(0xdff3ef);
  station.position.set(16, 0, -1.6);
  scene.add(station);
  const finale = pedestal(0xffe9cc);
  finale.position.set(17.6, 0, 1.8);
  scene.add(finale);

  // walkable model: circles (main, dock, islet) + rectangles (necks, bridge)
  const walk = {
    circles: [[0, 0, 10.3], [0, 12.4, 2.6], [16, 0, 4.4]],
    rects: [[-0.9, 9.6, 0.9, 10.6]],                // dock neck (x1, z1, x2, z2)
    bridgeRect: [10.2, -0.85, 11.8, 0.85],
    bridgeOpen: false,
    garden2Open: false,
    garden2Rect: [-7, -13, 7, -7.4],                // area behind the hedge
    // solid things the robot cannot walk through (x, z, radius) — lab,
    // pedestals, tree trunks; plant pots are added by main.js when placed
    obstacles: [[0, -3.4, 3.35], [8.4, 0, 0.75], [16, -1.6, 0.75], [17.6, 1.8, 0.75],
      ...TREES.map(([x, z, s]) => [x, z, 0.35 * s])],
  };

  return { sun, lab, barrier, gatePed, bridge, station, finale, walk };
}

// Clamp a desired position to walkable ground; returns the corrected point.
export function walkable(walk, x, z) {
  const inCircle = ([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 <= r * r;
  const inRect = ([x1, z1, x2, z2]) => x >= x1 && x <= x2 && z >= z1 && z <= z2;
  let ok = walk.circles.some(inCircle) || walk.rects.some(inRect) || (walk.bridgeOpen && inRect(walk.bridgeRect));
  if (ok && !walk.garden2Open && inRect(walk.garden2Rect)) ok = false;
  if (!ok) return null;
  for (const [ox, oz, r] of walk.obstacles) {
    const dx = x - ox, dz = z - oz, d = Math.hypot(dx, dz);
    if (d < r) return null;
  }
  return { x, z };
}
