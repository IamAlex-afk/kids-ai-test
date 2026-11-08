# Snake and Circuit Racer: completed visual pass

This update continues the original games branch from 2f481de and checkpoint 134901f. It keeps the existing game rules, age configurations, catalog and Runner. Rendering is Canvas 2D with perspective and original artwork, not a WebGL/rigged 3D implementation.

## Changes

- Snake: engraved teal board, glossy connected segments, shaded tube joints and a directional ivory monitor head. Body links never span a wrapped board edge. Existing movement interpolation and collision cells remain.
- Racer: four-wheel kart with the existing robot rider, steering response, shield ring and boost exhaust; a curved perspective road, continuous asphalt ribbons without polygon seams, reflective edges, rumble strips, trees, lamps and horizon haze.
- Road, player and collectibles share the same curved projection; the player collision plane stays centered. Lane interpolation uses elapsed time. Reduced-motion preferences disable decorative bounce and road curvature.
- No new third-party requests, account flow, storage writes, packages or art packs. Generated robot/background assets are already part of the preceding update. Credits updated.

## Verification on 2026-10-31

- `node --test tests/*.test.mjs`: 66 total, 60 passed, 6 live-site checks skipped because LIVE_URL is unset, 0 failures.
- `node tools/build.mjs --check`: passed; 426 published files and local links checked. Review screenshots/docs are excluded from the published site by the existing allowlist build.
- Browser, Russian age 5–7: Snake starts, resumes, turns downward from the touch button, pauses and exits to the catalog.
- Browser, same age: Racer starts, collects the first letter (HUD changes to 1/11 and target to О), changes to the right lane, pauses, opens/closes Help while retaining manual pause, and exits to the track picker.
- For both games, game-container client and scroll sizes match 390×844 and 844×390. Racer landscape controls end at y=380 inside the 390px viewport. Rotation preserves the run and pauses it.
- Screenshots: `kids-snake-20261031.jpg`, `kids-racer-portrait-20261031.jpg`, `kids-racer-landscape-20261031.jpg`. These are actual browser gameplay screenshots, cropped to the complete game viewport, not concept art.

## Limits and remaining acceptance

This is an iframe viewport check, not a physical phone test or a full playthrough. All four age routes and ten languages were not manually replayed. Shield collection in Racer was attempted but not conclusively observed; do not report it as verified in this pass. Bonus lifetime/one-hit behavior and pause lifecycle have unit coverage; the preceding Runner report includes observed armor collection.

Snake preserves its logical board on rotation, so a portrait board is letterboxed in landscape instead of moving existing targets. Native fullscreen success, sustained device performance and family playtesting remain outstanding. No PlayStation-equivalent or numeric visual-quality claim is made. The branch has not been pushed to GitHub by this environment.

## Integration

Apply the final full binary patch from base 5f9dddd to a separate branch after `git apply --check`. It supersedes the earlier exports of the same branch; do not apply both. Reconcile with newer main changes instead of force-pushing or resetting. Run the full test suite and allowlist build again after integration, then review the deployed preview. Local QA directories must not be published.
