# Expedition browser follow-up — 3 November 2026

## Fix

The previous portrait Snake grid retained its shape after rotating into landscape, leaving broad empty margins. Snake now transposes grid dimensions, body and interpolated body coordinates, target, decoys and direction when the viewport orientation changes. Shared coordinate objects are transformed once. Transient effects are repositioned; the canvas and cached board are resized at a capped device pixel ratio. The active round and progress remain intact. Existing session controls still pause on rotation.

A regression test moves the real Snake through the normal callbacks, rotates the board, collects the transposed target, advances to Coral bay and rotates back. It checks target collection and next-location progression rather than only the resize implementation.

## Actual browser observations

Local production build at http://terminal.local:4173/, version 4b3b7ee2bce3. Russian, age 5–7. A QA-only iframe exercised 390×844 and 844×390; this is viewport emulation, not a physical-device test.

- Snake level map opens with fourteen levels for this age/language, future levels disabled. First forest level opens with the mechanical robot Snake and illustrated board.
- Pause and exit work. Exit returns to the level map; its back control returns to the original game catalog.
- After the fix, the landscape Snake canvas is 572×364 in the available game area. It no longer retains the narrow portrait board. Rotating back retains a fitting portrait layout.
- Garage displays three distinct models. Buggy selection is retained when exiting the run. Capsule selection changes the actual vehicle rendered on the track.
- Both buggy and capsule runs start and pause. Buggy inspected at both orientations; capsule inspected in portrait. Landscape game content client and scroll dimensions both 820×370: no content overflow.
- Console error query filtered to terminal.local returned no entries. Unfiltered logs contained browser-extension metadata errors; these are not application errors. This is a scoped observation, not a guarantee of error-free operation.

## Evidence

These are screenshots of the running games, not concept art:

- kids-snake-landscape-20261103.jpg
- kids-racer-landscape-20261103.jpg
- kids-capsule-20261103.jpg

## Automated validation

72 tests: 66 passed, 6 skipped because LIVE_URL was unset, 0 failed. Following a test-fixture cleanup, the three expedition tests passed again. Allowlist build passed: 427 files, 10572 KiB, 69 offline entries; local links valid. git diff --check passed.

## Remaining acceptance work

Full campaign playthrough and visual inspection of all four locations, every age/language combination, sustained gameplay, shield pickup/collision in Racer, physical touch devices, native fullscreen and device performance remain outstanding. Rendering tests cover all twelve location/vehicle combinations with and without assets, but cannot establish visual quality or usability. No GitHub push or production deployment was performed here.
