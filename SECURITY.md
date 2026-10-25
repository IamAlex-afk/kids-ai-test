# Security Policy

## Supported versions

Only the latest version deployed at
https://iamalex-afk.github.io/kids-ai-test/ is supported.

## How the site works (what there is to protect)

Kids AI Test is a static site on GitHub Pages.

- No backend code of our own, no database, no user accounts
- No ads, no trackers, no analytics; quiz answers are not sent anywhere
- Like any website, the host (GitHub Pages) receives ordinary page requests
- Progress stays in the browser tab by default; it is saved on the device
  (`localStorage`) only after an explicit choice, and can be deleted in the 💾 panel
- A Content Security Policy is set via a `<meta>` tag; GitHub Pages does not let us
  set custom HTTP headers, so protections that need headers (e.g. `frame-ancestors`)
  are not in place
- The service worker caches this site's static files only

This is a description, not a guarantee: bugs are possible, which is why reports help.

## Reporting a vulnerability

Please report privately through GitHub:
**Security → Report a vulnerability** on
https://github.com/IamAlex-afk/kids-ai-test/security/advisories/new

- Do **not** open a public issue for a vulnerability.
- Do **not** include passwords, tokens, or any personal information about children
  in a report. A description and steps to reproduce on the public site are enough.

Reports are handled by a single volunteer maintainer on a best-effort basis;
there is no guaranteed response time.
