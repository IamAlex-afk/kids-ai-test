# Game progress — 3D level «Остров примеров»

Updated: 2026-10-26 · branch `feat/3d-island` (from `main` 9303762)

## Done (code written)

- `js/island/model.js` (1-NN, scaling, level data, age variants), `logic.js`
  (stage machine shared by 3D and text), `world.js` (procedural world),
  `robot.js` (procedural robot + animation), `ui.js` (HTML HUD, dialogs, pad,
  text version), `main.js` (renderer, input, camera, loop, pause, low mode,
  context loss, dispose, screenshot states), `lang/*.js` (10 languages).
- `island/index.html`, `css/island.css`; entry in the game picker (10 languages)
  linking to `island/?lang=…&age=…`; storage prefix `kat_island_`.
- Build allowlist + on-demand (not precached) for the level and three.js.
- Tests: `tests/island.test.mjs` (model, every age's flow, 10-language keys,
  CSP/no network/no storage in new code, three.js hashes).
- CI: `.github/workflows/preview.yml` — headless Chrome screenshots (software
  WebGL) as an artifact on each PR.

## Verified

See the PR for the actual CI results; nothing is claimed here until it ran.

## Not verified yet / limits

- Real devices, real frame rate (CI uses software rendering — its fps is not a
  measure), touch on a phone, screen reader, 200% zoom.
- Gzipped transfer size of the first game load (raw: three.js ≈ 721 KB + level
  ≈ 100 KB; measure on the live site).
- Native-speaker review of the 9 translations.
- Asset-load failure: the level has no external assets (all procedural), so
  there is nothing to fail except the scripts themselves.

## Next

1. Fix what the screenshots show; tune camera, lighting, readability.
2. Measure on a mid-range phone and a desktop; record device + fps here.
3. Replace placeholders with final art when available (see asset list in the PR / handoff).
