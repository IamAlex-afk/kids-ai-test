# Kids AI Test

A free, ad-free, zero-tracking PWA that teaches kids (ages 3–17+) how AI actually works — through
age-adapted lessons, a quiz, three mini-games, and a unique SHA-256-verified "trading card" that
proves they finished.

**Live site:** https://iamalex-afk.github.io/kids-ai-test/

## Structure

- `index.html`, `{lang}.html` — 10 languages: en, ru, de, es, fr, hi, id, pt, tr, vi
- `js/core.js` — main app logic (age selection, lessons, quiz, results)
- `js/snake.js`, `js/platformer.js`, `js/racing.js` — the three mini-games
- `js/card.js` — SHA-256 verified result card generator
- `js/companion.js`, `js/glossary.js`, `js/leaderboard.js`, `js/names.js`, `js/parents-faq.js` —
  supporting features
- `data/{lang}.js` — per-language lesson/quiz content
- `css/main.css` — all styling, age-based theming via `[data-age]`
- `assets/` — sprite art (CC0-licensed, see `assets/CREDITS.md`)
- `robots.txt`, `sitemap.xml`, `llms.txt`, `ai.txt` — SEO and AI-crawler discoverability
- `manifest.json`, `sw.js` — installable PWA with offline support
- `.well-known/security.txt`, `SECURITY.md` — security contact and policy

## Privacy

No accounts, no ads, no analytics. Everything runs client-side; progress is stored only in the
browser's own `localStorage`.

## Deploy

Static site, auto-deployed to GitHub Pages on every push to `main`. No build step.

## License

GPL v3 — see [LICENSE](LICENSE).
