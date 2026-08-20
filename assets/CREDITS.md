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

- `car-cyan.png`, `car-red.png`, `car-gold.png` (56x133 each) — from
  "Free Top Down Car Sprites" by UnLucky Studio (unluckystudio.com),
  Car.png (256x256, originally solid orange). Modifications: cropped to
  the car's bounding box, hue-shifted to cyan/red/gold via HSV rotation
  (only saturated pixels re-hued, so tires/glass/shadows keep their
  original tone), downscaled to 56px wide.
  Source: https://opengameart.org/content/free-top-down-car-sprites-by-unlucky-studio
  License: CC0 (public domain), see the pack's included Read Me.txt

Circuit Racer's roadside trees and lamp posts, and the traffic/player
fallback car, are drawn procedurally in `js/racing.js` (no image assets)
— see that file's `drawTree`/`drawPole`/`carBody` functions.

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
