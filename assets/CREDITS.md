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
