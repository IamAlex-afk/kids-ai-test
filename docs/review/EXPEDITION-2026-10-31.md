# Robot Snake, locations and garage — 31 October 2026

## Implemented after b88b2e8

- Snake has ivory mechanical armor segments, teal cores, orange joints and a larger expressive monitor head. Wrapped neighbors still do not connect across the board.
- Four project-generated environment illustrations: forest laboratory, coral bay, sun canyon and orbital station. They are one compressed local WebP atlas (521126 bytes). The renderer crops a single quadrant, keeping adjacent locations out of portrait/landscape frames. Fallback colors work before the asset loads; cached Snake boards repaint when it finishes loading.
- Snake now opens a level map. Existing educational rounds become numbered levels. Completion opens the next level; completed levels can be replayed. Each successive level changes location, cycling through the four environments. This is four locations, not a different illustration for every round.
- Snake progress is separated by language and age, stored through KAT_Store under the explicitly owned kat_snake_levels key. Default tab-only storage and optional device-saving consent remain intact. Exit from play returns to the level map, and its back button returns to the existing catalog.
- Racer retains the existing lesson tracks and star-unlock rules. Every track has a location thumbnail and localized location title; road colors and roadside objects change between trees, coral, rock towers and crystals.
- A garage is available immediately. Kart, buggy and capsule have distinct procedural shapes. Models share handling, hitboxes and age difficulty; the choice is cosmetic and free. Existing cyan/red/gold saved selections map to these models, with invalid values falling back to the kart. The chosen model is passed into each run.
- Existing Runner, catalog, gameplay bonuses and age configurations remain. No new engine, package, third-party network request, account flow or tracking.

## Verification

71 tests: 65 passed, 6 live-site checks skipped (LIVE_URL unset), 0 failures. Allowlist build and local-link checks pass: 427 files, 69 precached entries. git diff --check passes.

New Node VM tests exercise actual Snake menu/game callbacks: disabled future level, first target collection, completion, transition to Coral bay, exit to map, saved unlock and age separation. Garage tests exercise selection, persistence, invalid-value fallback and passing the buggy/capsule into the renderer on launch. These use a minimal DOM/timer fixture; they are not Chrome tests.

Renderer tests cover the four atlas crops at portrait/landscape sizes, localization coverage, invalid indices, all twelve model/location combinations and finite geometry with loaded or missing image assets.

## Browser verification blocked

The cloud browser's automatic approval review rejected opening the local preview because the usage limit was reached. No alternate browser or bypass was attempted. This revision has NOT been visually inspected in a running browser. Earlier screenshots and viewport checks in SNAKE-RACER-2026-10-31.md describe b88b2e8, not this revision. Do not claim those are evidence for the new atlas/menu/garage.

Before production promotion: run the actual browser route on 390×844 and 844×390; check each language's menu labels, full-screen/rotation, text contrast over illustrated boards, level completion/replay, garage choices on a real track, all four track locations and exit navigation. Verify no clipped controls or console errors. Preserve the older version if visual review identifies problems.

## Asset provenance and generation prompt

Built-in OpenAI image generation was used. Source output: generated_images/exec-5fe6aca3-ab5d-496b-98ee-d37fef7d5186.png in the task workspace. The project consumes assets/workshop/game-locations-v1.webp. Conversion to WebP only; no third-party illustration was copied.

Prompt:

> Use case: stylized-concept. Asset type: one game environment atlas, exact 2 by 2 equal panels covering the entire square image with no gutters, frames, labels or text. Four beautiful original child-friendly polished 3D toy diorama environments, warm cinematic light and rich tactile detail, coherent ivory/turquoise robot-adventure aesthetic, no characters, vehicles, letters, roads or UI. Upper left: lush emerald forest laboratory clearing, giant rounded trees, tiny cream domed science pavilion and luminous cyan stream. Upper right: brilliant turquoise coral bay, cream sand, shell-shaped buildings, pink corals and ocean water. Lower left: sunset sandstone canyon with layered orange rock towers, desert plants and cream futuristic observatory. Lower right: peaceful violet outer-space station garden, distant ringed planet, stars, rounded lunar domes and glowing blue crystal clusters. Each panel independently composed as a wide-open empty central playable clearing occupying the middle 70 percent, scenery at the edges, camera elevated three-quarter diorama view. Distinct readable silhouettes and atmospheric depth. This atlas will be cropped into four game background textures. No text, logos or existing branded characters.

## Handoff

The full binary patch starts at 5f9dddd and includes earlier work from this branch. It supersedes previous full patches; do not apply multiple exports in sequence. Work on a separate integration branch, inspect current changes, check applicability, reconcile newer main work without force-push/reset, then rerun tests and browser checks. This environment has not pushed to GitHub.
