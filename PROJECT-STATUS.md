# Kids AI Test — project status

Updated: 2026-10-25 · branch `fix/current-site-honesty-privacy` · base `f32e618` (origin/main at start)

The learning2 handoff archive was **not available** in this environment. Nothing from it
was used; all work below is on the current GitHub code.

## Done in this branch

| Area | Change |
|---|---|
| Ages | 5–7 (with an adult) / 8–10 / 11–13 / 14+ in all 10 pages: titles, meta, JSON-LD (`suggestedMinAge` 5, course instances), top bar, age cards, flow step, parents' FAQ headings (`Under 5 · for parents`, `5–10`, `11–13`), `data/*.js` labels, `parents-faq.js`, manifest, README, llms.txt, ai.txt, og.svg. Age numbers inside FAQ answers about toddlers (e.g. "a 3–5 year old") are content, not mode labels, and were kept. |
| Honesty | Removed "Trusted by parents worldwide", "Cannot be faked", "unforgeable", "verified card", "Pokemon card… unforgeable", "beat 90% of adults" (share text), "better than most people/adults" (result titles and descriptions) in every language. The card is described as a keepsake: the public SHA-256 proves neither identity, uniqueness nor completion. "Unique card" → "personal card". |
| Network | Card no longer calls worldtimeapi.org (device clock); `connect-src 'self'` in all CSPs. Removed QR/share links to a non-existent `verify.html` (404). |
| Storage | New `js/storage.js` + `js/storage-ui.js` (💾 panel, 10 languages). Tab memory by default (sessionStorage → in-memory fallback); device saving only after an explicit switch; switch-off and delete remove only this project's keys; consent re-read on every write + `storage` event (revocation in another tab); quota/partial-write rollback; corrupted values ignored; saves from older versions are not read or overwritten until "keep" or "delete". All modules (core, snake, platformer, racing, companion, leaderboard) go through it. Stored strings are stripped of `<` `>` and prototype keys; saved core state is type-checked before rendering. |
| Service worker | Deletes only `kids-ai-test-*` and the six known legacy `kat-2026-*` caches; a failed/partial install is discarded so the previous complete cache stays; pages network-first, assets stale-while-revalidate, both only from its own cache and only inside the project scope. |
| Publishing | `tools/build.mjs` builds `dist/` from an explicit allowlist (pages, assets, icons, LICENSE, SECURITY.md, Google verification file, `.well-known/security.txt`…), rewrites the SW cache name (content hash) and full precache list, writes `version.json`, `--check` fails on broken local links. Single workflow `.github/workflows/pages.yml`: PRs build + test only (read-only, no secrets); main deploys `dist/` only; all actions pinned to full SHAs; `persist-credentials: false`. |
| Security docs | SECURITY.md: private reporting via GitHub Security Advisories, no secrets/children's data in reports, no guaranteed response time, no absolute claims; notes that meta CSP cannot set `frame-ancestors`. security.txt: RFC 9116 fields, scoped to the project subpath. |
| Projects | Mind-OS removed from author/provider metadata, footer © and humans.txt (authorship = Aleksei Sergeevich Bitkin, as in LICENSE). |
| Translations | English fallbacks in the static mode picker of 7 pages (de, es, fr, hi, id, pt, tr) replaced with existing translations from `MODE_STR`. Share button text localized for all 10 languages (was 5). |
| Back button | One history entry per opened lesson/game/quiz; browser Back closes it (games via their own exit button), never re-pushes (no loops); in-app ✕ removes the entry. Not yet browser-tested. |
| Code scanning | `.github/workflows/codeql.yml` (JS, pinned SHA, `security-events: write` only in that job) and `.github/dependabot.yml` (monthly updates of pinned actions). No `npm audit fix --force`: the site has no npm dependencies. |
| Tests | `tests/storage.test.mjs`, `tests/sw.test.mjs`, `tests/static.test.mjs` (`node --test tests/`, no dependencies). |

## Checked

- Code reading and repository-wide searches (no remaining banned claims, no direct storage access outside `storage.js`, no third-party `fetch`, age labels).
- GitHub: commits, Actions runs (`gh run list`), Pages config (`build_type: workflow`, no CNAME) — read-only.

## NOT yet checked (environment blocked `node`, `npm`, `curl`, `python` without interactive approval)

- `node tools/build.mjs --check` and `node --test tests/` — not run locally. They run in CI on the PR.
- Browser run (entries, four ages, lessons, games, keyboard, print, back button, offline, SW update from the old version), Lighthouse, live headers/CSP of the published site.
- `og.png` still shows "Ages 3 – 17" (raster; needs re-rendering from `og.svg`).

## Published

Nothing from this branch is published yet. Live site = `main` (`f32e618`).

## Architecture

See `docs/ARCHITECTURE-DECISIONS.md`: shared github.io origin (storage not
isolated from sibling projects; separate origin recommended — owner decision),
measured build size (≈2.86 MB total, ≈0.86 MB first load; plan to lazy-load games
and per-language parents' FAQ), no WebMCP, search policy.

## Open questions for the owner

1. Footer link to `human-os-patch-33-protocols` and the 14+ book recommendation (Amazon/Litres) link to other projects/products — keep, or remove from the kids' site?
2. Enable **Private vulnerability reporting** in repo Settings → Code security (needs admin; SECURITY.md already points there).
3. Search Console: submit `sitemap.xml` (only the owner can; the subpath robots.txt is not read by Google).
4. Separate origin for the kids' site: own GitHub organisation (`<name>.github.io`, free) or a subdomain of an owned domain? Nothing is migrated until decided.

## Remaining work (next steps, in order)

1. Run build + tests (CI on PR or locally once allowed), fix failures, browser check, merge, confirm deploy and live version (`version.json`).
2. "Every question has a verified source" / "verified against primary sources" lines in pages and footer → per-claim source registry (claim → source → what it supports) before rewording.
3. Lesson registry (ID, skill, age, language status, source, review date) to drive navigation/sitemap.
4. Age adaptation of tasks (not just labels): 5–7 read-aloud flow with an adult.
5. "Check the plan" robot lesson (one full loop, four age modes).
6. Separate domain assessment (shared github.io origin ⇒ storage is not isolated from other sites).
