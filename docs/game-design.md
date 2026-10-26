# Game design — 3D level «Остров примеров» / "Island of Examples"

Status: first level, beta. Branch `feat/3d-island`. Decisions below are binding
for this level; change them here first.

## What the player learns

A program can only learn from the examples it is given. Examples with a hidden
pattern teach the wrong rule; examples that break the pattern fix it, "more of
the same" does not; you find out whether it works by checking on things it has
never seen. 14+: memorising examples (100% on them) ≠ being right on new ones.

## The model (honest by construction)

`js/island/model.js` — 1-nearest-neighbour on two ready-made numbers per plant:
height (10–90 cm) and leaf colour as a hue (0 teal … 1 orange), both min–max
scaled to 0–1. It never sees the 3D picture. Not a neural network. Ties go to
the earlier example. True rule (unknown to the model): colour decides.
The first garden is biased (all teal plants tall, all orange short), so the
short teal plant at the gate is wrongly called "desert" — computed, not scripted
(`tests/island.test.mjs` proves it for every age).

## Loop and level (5–8 min target, no timer)

arrive (dock → glass lab) → collect examples in the west garden → test at the
east gate (8–10+: guess first) → wrong; the hedge behind the lab opens → add
examples → re-test → bridge extends → east islet: check station on unseen
plants → summary pedestal (what you found out + limits).

## Age variants (starting settings, not a judgement)

| Age | What changes in the task |
|---|---|
| 5–7 with an adult | 4 example plants, need 3 (1 of each kind); one check at the gate; calm controls on; short texts |
| 8–10 | 6 + 4 plants; guess before the program answers; 4 check plants; hints optional |
| 11–13 | + unbalanced garden 2, a borderline plant (leaf colour in between), comparison of the first and the current example set |
| 14+ | + accuracy on own examples (100%) vs on new plants; limits: method, bias, generalisation |

## Visual language (procedural placeholders, no final art yet)

Light sky of floating islands, stone paths, glass lab, rope bridge, distant
islands and clouds for depth, soft hemisphere + sun light with soft shadows,
blob contact shadow under the robot, ACES tone mapping. Robot: original design
from primitives — white ceramic body, blue joints, teal visor/details, orange
backpack; procedural animation (idle breathing, walk cycle, interact reach,
"oops" head-shake, happy hop). Category marks are shape + word (drop / sun),
never colour alone. All text is HTML over the canvas.

## Tech

three.js r180 (MIT) vendored in `js/vendor/three/` (hashes in its README), ES
modules, no build step, no CDN. Loaded only by `island/index.html`; the main
pages and lessons are unchanged in weight. Site CSP unchanged (`script-src
'self'`). Not precached; the service worker keeps it after the first visit.
Fallbacks: no WebGL / context lost → text version of the same task.
Quality: devicePixelRatio ≤ 1.75 (1 in low mode), 1024 shadow map, automatic
low mode if < 24 fps over 3 s, manual "lower graphics" switch.

## Rules kept

No accounts, ads, analytics, external chat, camera/microphone, names or
personal data; answers never leave the browser; only `kat_island_v1 = {done}`
is stored, through the site's storage choice (tab memory unless device saving
was switched on). Old games stay available.
