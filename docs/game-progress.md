# Game progress — 3D level «Остров примеров»

Updated: 2026-10-26 · branch `feat/3d-island` (from `main` 9303762) · draft PR #5

## Done

- One complete level, start → summary: model (`js/island/model.js`, 1-NN on two
  scaled features), stage machine (`logic.js`, shared by 3D and text versions),
  procedural world (`world.js`), procedural robot with walk/idle/interact/oops/
  happy animation (`robot.js`), HTML HUD + dialogs + touch pad + text version
  (`ui.js`), renderer/input/camera/loop/pause/low-quality/context-loss/dispose
  (`main.js`), texts in 10 languages (`lang/*.js`).
- `island/index.html` (site CSP, noindex), `css/island.css`; game-picker entry in
  10 languages; storage prefix `kat_island_` (only `{done}` is stored, through
  the site's storage choice).
- Build allowlist; the level and three.js are NOT precached (on demand).
- three.js r180 vendored unchanged (SHA-256 in `js/vendor/three/README.md`,
  `.gitattributes` keeps bytes exact on Windows).

## Verified (actually run)

- CI on PR #5: build + local-link check OK; **50 tests, 45 pass, 0 fail, 5
  skipped** (live-site checks, they run after deploy); CodeQL pass.
- Tests cover: the model's mistake is computed (gate wrong with biased examples,
  fixed only by pattern-breaking ones), check plants never train it, full flow
  for each of the 4 ages, 10-language key parity, CSP / no network / no direct
  storage in the new code, three.js hashes.
- Screenshots: headless Chrome on the CI runner, **software WebGL
  (SwiftShader), no GPU**: desktop 1280×800 (start, garden, gate, bridge,
  summary; ru/en/de; ages 5–7, 8–10, 14+), phone 390×844 (en, ru), text
  version. After the fixes in commit 78e001d: **no console errors** in any shot.
- First screenshots found and led to fixes: a crash in the summary/check
  dialogs and the text version; grey-green "teal" leaves; small plants;
  overlapping phone header; clipped "Action" label.
- Size: first game load ≈ 813 KB uncompressed (page + CSS + modules + one
  language + three.js). Gzipped size not measured yet.

## Not verified

- Real devices and real frame rate (software rendering in CI says nothing about
  phones); the 30 fps (phone) / 60 fps (desktop) targets are unmeasured.
- Interactive play by a person: keyboard walk-through, touch pad on a phone,
  pause on a hidden tab, restart, age switch, exit (code paths exist; the
  screenshot states drive the same functions but are not a playthrough).
- WebGL context loss and "no WebGL" in a real browser (fallback code exists).
- Storage with device saving switched on/off (uses the site's tested module).
- Screen reader, 200% zoom, reduced motion in a browser.
- Native-speaker review of the 9 translations.
- Gzipped transfer size; Lighthouse.

## Next

1. A person plays it through on a desktop and a mid-range phone; record device,
   browser and fps here.
2. Visual polish once final art exists (see the asset list in the handoff).
3. Then decide whether to merge (the level stays "beta"; old games unchanged).
