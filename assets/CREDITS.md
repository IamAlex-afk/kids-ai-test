# Asset credits

- `robot-sheet.png` — recolored/downscaled from Kenney's "New Platformer
  Pack" (kenney.nl/assets/new-platformer-pack), character_green_* frames.
  Modifications: recolored to a metallic palette, downscaled from
  128x128 to 64x64, repacked into a smaller sheet containing only the
  frames used (idle, walk_a, walk_b, jump, duck, hit).
  License: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/

- `bg-clouds.png` — unmodified, from Kenney's "New Platformer Pack"
  (kenney.nl/assets/new-platformer-pack), Sprites/Backgrounds/Default.
  License: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/

- `bg-stars.png` — unmodified, from Kenney's "Space Shooter Remastered"
  (kenney.nl/assets/space-shooter-remastered), Backgrounds/black.png.
  License: CC0 1.0, https://creativecommons.org/publicdomain/zero/1.0/

- `bg-clouds-hills.png`, `bg-clouds-trees.png`, `bg-clouds-desert.png` —
  unmodified, from Kenney's "New Platformer Pack", Sprites/Backgrounds/
  Default/background_fade_{hills,trees,desert}.png. Same pack as
  bg-clouds.png, used so the platformer's worlds (per age, up to 9) don't
  all show the identical sky. License: CC0 1.0.
- `bg-stars-blue.png`, `bg-stars-purple.png`, `bg-stars-darkpurple.png` —
  unmodified, from Kenney's "Space Shooter Remastered", Backgrounds/
  {blue,purple,darkPurple}.png. Same pack as bg-stars.png, same purpose.
  License: CC0 1.0.

Circuit Racer's current kart, tires, road, trees and lamps, and Snake's
rounded body and monitor head are original procedural Canvas artwork in
`js/game-worlds.js` (2026-10-31). The kart's rider uses the project-generated
robot sprites credited below. The earlier procedural running-bot renderer
remains in `js/racing.js` as a fallback; no third-party car model, game engine
or new art pack was introduced by this update.

- `sfx/round-complete.ogg` — from Kenney's "Music Jingles" pack
  (kenney.nl/assets/music-jingles), 8-Bit jingles/jingles_NES05.ogg.
  Unmodified. License: CC0 1.0.
- `sfx/pickup.ogg`, `sfx/jump.ogg` — from Kenney's "Digital Audio" pack
  (kenney.nl/assets/digital-audio), powerUp5.ogg and phaseJump1.ogg.
  Unmodified. License: CC0 1.0.
- `sfx/miss.ogg`, `sfx/click.ogg` — from Kenney's "Interface Sounds" pack
  (kenney.nl/assets/interface-sounds), error_001.ogg and click_001.ogg.
  Unmodified. License: CC0 1.0.
  (`jump.ogg`, `miss.ogg`, `click.ogg` are downloaded and credited for
  upcoming use in racing.js/platformer.js — only `round-complete.ogg` is
  wired into a game so far, in js/snake.js's sndWin().)

- `workshop/hero.webp`, `workshop/hero-small.webp` — the floating-island
  illustration of the project's own earlier "workshop" version
  (kids-ai-test-lab.vonychkalesha.chatgpt.site/assets/workshop/), reused
  unmodified by the project owner. Downloaded 2026-10-26; verified as real
  WebP files (RIFF/WEBP VP8), 1200×800 and 660×440.

## Original games garden backdrop (2026-10-30)

`assets/workshop/game-garden-v1.webp` was generated for this project with OpenAI image generation. It is a decorative environment, not an illustration of an AI system or evidence of gameplay. Tiles, road and objects are drawn by the project's Canvas renderer in `js/game-worlds.js`. No additional third-party game engine or art pack is used by this update.

## Original robot sprites (2026-10-30)

`robot-explorer-v2.png` and `robot-armor-v2.png` were generated for this project with OpenAI image generation, with transparent backgrounds. The second image preserves the first character's pose and adds a protective robot vest. These are raster sprites rendered in Canvas 2D, not rigged 3D models or PlayStation assets. The earlier Kenney assets and credits are retained.

Art direction: a friendly rounded ivory-and-turquoise explorer robot, expressive cyan eyes, orange shoes, polished toy-like depth, full body in a right-facing three-quarter pose; matching armor with an ivory/turquoise breastplate, shoulder protection and a shield emblem. The artwork represents a fictional game character and makes no claim about AI consciousness.

## Four expedition locations (2026-10-31)

`workshop/game-locations-v1.webp` — original four-panel environment atlas generated for this project with OpenAI's built-in image generation and encoded as WebP. Forest laboratory, coral bay, sun canyon and orbital station. Used by the Snake level map/board and Racer track cards/backgrounds. No third-party location, vehicle or character artwork was copied. The exact generation prompt and verification limits are recorded in `docs/review/EXPEDITION-2026-10-31.md`. The mechanical snake and three vehicle body designs are procedural artwork in `js/game-worlds.js`.
