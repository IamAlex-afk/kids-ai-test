# Existing games: visual and interaction update

This branch improves Snake, Circuit Racer and Circuit Runner. All three remain accessible through the direct All games button after age selection. It does not substitute AI Islands or add a 3D engine. The presentation uses Canvas 2D, original project-generated raster artwork, perspective, shaded objects and device-pixel-ratio rendering.

## Implemented

- Larger explorer robot and collectible letters; the original four age configurations remain, with age-dependent world framing and larger cells for the youngest Snake board. Shared age configurations are not mutated by viewport sizing.
- Original generated garden backdrop, base robot and matching armored robot. Existing green/gold color choices tint the sprite. Procedural fallback remains if artwork has not loaded.
- Runner: armor absorbs one collision or expires after 12 active seconds; high jump increases jump velocity by 20% for 10 active seconds; magnet attracts nearby letters for 8 active seconds. Spring pickups are removed after collection so the same object cannot retrigger indefinitely. Racer uses the same armor model.
- Effects have visible localized countdowns. Recollecting refreshes duration without multiplying jump strength. Pause/help stop bonus time; a monotonic clock and timestamp reset prevent a suspended tab from spending the bonus on resume.
- Games fill the viewport with exit, pause, contextual help, target and touch controls. Native fullscreen is attempted from a valid user activation and can be requested again with a button. Unsupported native fullscreen retains the viewport layout.
- Runner/Racer resize their world and reposition existing entities when the viewport changes. Rotation pauses play. Snake preserves its board and fits it inside the new viewport.
- Landscape layout has a compact labeled HUD, accessible icon buttons and visible action buttons. Help is a keyboard-accessible modal. Manual pause survives opening/closing Help. Backgrounding requires explicit resume.
- Gentle pace in Help scales movement/physics to 0.65 without restarting the run; bonus durations remain real active seconds. No new persistent storage or third-party requests.
- Controls/help/bonus labels cover the ten existing languages. Native-speaker review is still needed.

## Verification

- Automated tests cover bonus lifetime, one-hit armor, stronger/expiring jump, independent timers, refreshed bonuses, invalid input, renderer asset selection, finite fallback geometry, age framing, racing projection, help/pause/fullscreen lifecycle and loading order.
- Full suite: 58 passed, 6 live-site checks skipped because LIVE_URL was not supplied. Build and local-link checks pass.
- Browser: Russian 5–7 Runner launched with the new sprite. Collected a letter and shield through normal play; armor appeared. The visible armor timer stayed at 9 seconds while paused across subsequent interactions.
- Browser: Runner viewport at 390×844. Active game scroll/client dimensions matched. At 844×390, found and fixed clipped controls; after the fix the game scroll/client dimensions matched 844×390 and the jump button ended at y=380. These are browser iframe viewport tests, not physical-device certification.
- Final-build browser smoke checks also launched Racer and Snake at 844×390, verified visible controls ending at y=380 with no game-container overflow, changed a racing lane, and returned from the track to the catalog. Runner Help closed back to the existing manual pause.
- Earlier browser checks covered the three-game launch route, Snake help/exit/rotation, Racer first-letter collection, and Runner jump/help/gentle pace. New high-jump duration/strength and magnet duration are unit-tested; a full manual traversal of their random pickups across all ages has not been completed.
- Native fullscreen is blocked by the cloud browser. Its fallback was observed and lifecycle tested with a unit fixture; successful native fullscreen on physical devices remains unverified.

## Handoff

Base: `5f9dddd`. Branch: `feat/original-games-visuals-20261030`. Do not overwrite newer main work. Apply the exported binary patch only after checking it against the target checkout, or merge the branch commits when available. If conflicts occur, reconcile them file-by-file; do not force-push or reset main.

Run `node --test tests/*.test.mjs` and `node tools/build.mjs --check` after integration. Test actual phone portrait/landscape and all age routes before production promotion. Do not include `.preview/` or `.openai/` from this checkout in GitHub Pages; they are local QA infrastructure.

## Limits

This update is not a complete audit of every lesson, translation, game world or age. It is not PlayStation-equivalent graphics, and no numerical “10× better” claim is made. The public GitHub Pages site has not been updated by this local branch. Existing educational content, progression balance and device performance still need separate review and family playtesting.
