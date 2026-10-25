# Kids AI Test — architecture decisions (assessment, 2026-10-25)

Status of this document: analysis and recommendations. Nothing here has been
bought, migrated or enabled automatically. Statements about external services
marked *(to verify)* were written without access to the source page in this
session (web access was blocked) and must be checked against the linked
document before acting on them.

## 1. Origin isolation: separate domain or subdomain

### Facts
- The site lives at `https://iamalex-afk.github.io/kids-ai-test/`. Every project
  of this GitHub user (`/ai-lab/`, `/human-os-patch-33-protocols/`, …) is served
  from the **same origin** `https://iamalex-afk.github.io`.
- Browsers isolate storage **per origin, not per path**. Any page of any of these
  projects can read, change or delete this site's `localStorage`,
  `sessionStorage`, IndexedDB and Cache Storage, and can list and unregister its
  service worker (`navigator.serviceWorker.getRegistrations()`).
- Key prefixes (`kat_…`) avoid accidental collisions only; they are not isolation.

### What is already mitigated in code
- Progress is tab memory by default; device storage only after consent.
- This site deletes only its own keys and its own caches.
- Everything read back from storage is sanitised (no markup, no prototype keys,
  type-checked core state) before it can reach `innerHTML`.

### Options
| Option | Isolation | Cost | Effort / risk |
|---|---|---|---|
| A. Keep `iamalex-afk.github.io/kids-ai-test/` | none from sibling projects | 0 | none |
| B. Separate GitHub account or organisation → `<name>.github.io` (user/org site) | own origin | 0 | new repo/owner, new Search Console property, URL change |
| C. Custom subdomain on an owned domain (CNAME on GitHub Pages) | own origin | domain registration (yearly) | DNS + HTTPS setup; GitHub redirects the old project URL to the custom domain *(to verify)* |

### Recommendation
**C** if the owner already has (or wants) a brand domain; otherwise **B** (free).
Either way it is a one-time URL change, so do it once, before the site grows:
update canonical/hreflang/sitemap/manifest/`og:url`, add a Search Console
property for the new origin, keep the old URLs redirecting. Saved progress does
not move between origins; with tab memory as the default, little is lost.
**Owner decision required.** Until then, option A with the mitigations above.

## 2. GitHub Pages limits and build size

### Measured (2026-10-25, uncompressed, before gzip/brotli by the host)
| What | Size |
|---|---|
| Everything `tools/build.mjs` publishes | ≈ 2.86 MB |
| First visit to `index.html` (HTML + CSS + all scripts it loads) | ≈ 0.86 MB |
| …of which the three games (`snake`, `platformer`, `racing`) | ≈ 0.22 MB |
| …of which `parents-faq.js` (all 10 languages loaded on every page) | ≈ 0.19 MB |
| All `data/*.js` (10 languages) | ≈ 1.08 MB |

### Limits *(to verify at docs.github.com/…/github-pages-limits)*
Published site size limit (about 1 GB), a soft monthly bandwidth limit
(about 100 GB) and deployment time limits. At ~3 MB total the site is far below
the size limit; bandwidth depends on traffic and is not measured (no analytics by
design — GitHub does not expose per-site traffic for Pages *(to verify)*).

### Decisions
- **Stay on GitHub Pages.** No measured need to move.
- `tools/build.mjs` prints total size and offline-set size on every build; keep
  an eye on it in CI logs.
- **Reduce first-load weight (planned, needs browser testing):**
  1. Load game scripts only when a game is opened (dynamic `<script>` insert),
     not with the first lesson.
  2. Split `parents-faq.js` per language (only the page's language is loaded).
  3. Offer the full offline set explicitly with its size, instead of
     precaching everything on the first visit.

## 3. Agent technologies (WebMCP etc.)

- Not adopted. Experimental agent interfaces are not required for the site to
  work, to be accessible, or to be indexed.
- Priority stays: semantic HTML, real buttons and links, labelled controls,
  predictable navigation (including browser Back).
- Children's progress is never exposed to agents or any external interface.

## 4. Search (policy for this project)

- Search Console only with the owner's access. Do not claim sitemap submission
  or indexing without seeing the result there.
- Google Indexing API is not used: it is meant for job-posting and livestream
  pages, not lessons.
- No promises of rankings, of compliance with every country's law, or of
  content staying current through 2027.
- FAQ rich results and practice-problem results are no longer shown by Google
  (per the owner's 2026-10-25 brief); the FAQs and exercises stay because they
  help people. Structured data must match visible content.
- `llms.txt` / `ai.txt` are kept as reference files only; they are not a
  ranking tool.

## 5. Content claims to re-check (from this review)

- "GDPR requires informed consent" (data files, several languages): consent is
  one of several lawful bases under GDPR; the sentence oversimplifies. Fix during
  the per-claim source review, in all languages at once.
- "Every question has a verified source…" / "verified against primary
  sources" (quiz intro, footer): replace with wording backed by the claim →
  source registry once it exists.
