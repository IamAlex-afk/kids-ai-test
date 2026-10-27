// Builds dist/ — the ONLY directory GitHub Pages publishes.
// Explicit allowlist: anything not listed here (reports, test harnesses,
// bot config, .audit, node_modules, notes) never reaches the public site.
//
//   node tools/build.mjs           build dist/
//   node tools/build.mjs --check   build, then fail on broken local links
//
// Also writes dist/version.json and rewrites CACHE + PRECACHE in dist/sw.js
// so every deploy gets a fresh, complete offline set.

import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERIES_LANGS } from './series.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const pageOf = (l) => (l === 'en' ? 'index.html' : `${l}.html`);

const FILES = [
  ...LANGS.map(pageOf),
  '404.html', 'manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml',
  'favicon.ico', 'favicon.svg', 'icon-192.png', 'icon-192-maskable.png', 'apple-touch-icon.png',
  'og.png', 'og.svg',
  'googled8a35f2a8c073799.html',          // Search Console ownership file — keep its URL
  'LICENSE', 'SECURITY.md', 'humans.txt', 'llms.txt', 'ai.txt', '.nojekyll',
  '.well-known/security.txt',
];
// Directories copied with an extension filter (no dotfiles, no subfolders not listed).
const DIRS = [
  { dir: 'css', ext: ['.css'] },
  { dir: 'js', ext: ['.js'] },
  { dir: 'data', ext: ['.js'] },
  { dir: 'assets', ext: ['.png', '.ogg', '.md'] },
  { dir: 'assets/sfx', ext: ['.ogg'] },
  { dir: 'assets/workshop', ext: ['.webp'] },
  // Lesson pages (tools/gen-lessons.mjs), one folder per language
  ...LANGS.map((l) => ({ dir: `lessons/${l}`, ext: ['.html'] })),
  // Workshop activities (tools/gen-series.mjs) — only the languages of the series
  ...SERIES_LANGS.map((l) => ({ dir: `workshop/${l}`, ext: ['.html'] })),
];
// Not cached offline: SW itself, verification/legal/info files.
const NO_PRECACHE = new Set(['sw.js', '404.html', 'googled8a35f2a8c073799.html', 'LICENSE',
  'SECURITY.md', 'humans.txt', 'llms.txt', 'ai.txt', '.nojekyll', '.well-known/security.txt',
  'robots.txt', 'sitemap.xml', 'og.svg', 'assets/CREDITS.md']);
// Lesson pages are not preloaded (290 pages): the worker keeps the ones a
// visitor has opened; lesson.css and lesson.js are in the offline set.
// Workshop pages and their scripts load only when an activity is opened
// (then the worker keeps them); they are not part of the first-visit set.
const ON_DEMAND = /^(lessons\/|workshop\/|js\/workshop|js\/sorter-model\.js$)/;
const precached = (f) => !NO_PRECACHE.has(f) && !ON_DEMAND.test(f);

function listFiles() {
  const out = [...FILES];
  for (const { dir, ext } of DIRS) {
    for (const name of fs.readdirSync(path.join(ROOT, dir))) {
      const rel = `${dir}/${name}`;
      if (name.startsWith('.') || !fs.statSync(path.join(ROOT, rel)).isFile()) continue;
      if (ext.includes(path.extname(name))) out.push(rel);
    }
  }
  return out;
}

function commit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try { return execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim(); } catch { return 'unknown'; }
}

function build() {
  const files = listFiles();
  const missing = files.filter(f => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length) throw new Error('Missing site files: ' + missing.join(', '));

  // Fresh dist/ (only this generated directory is ever removed).
  fs.rmSync(DIST, { recursive: true, force: true });
  const hash = createHash('sha256');
  let bytes = 0;
  for (const f of files.sort()) {
    const src = path.join(ROOT, f), dst = path.join(DIST, f);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    const buf = fs.readFileSync(src);
    if (f !== 'sw.js') hash.update(f).update(buf);
    fs.writeFileSync(dst, buf);
    bytes += buf.length;
  }
  const version = hash.digest('hex').slice(0, 12);

  // Service worker: content-hashed cache name + full precache list.
  const precache = ['./', ...files.filter(precached).map(f => './' + f)];
  let sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8');
  const before = sw;
  sw = sw.replace(/const CACHE = OWN_PREFIX \+ '[^']*';/, `const CACHE = OWN_PREFIX + '${version}';`);
  sw = sw.replace(/const PRECACHE = \[[\s\S]*?\];/, `const PRECACHE = ${JSON.stringify(precache, null, 2)};`);
  if (sw === before || !sw.includes(version)) throw new Error('sw.js markers not found');
  fs.writeFileSync(path.join(DIST, 'sw.js'), sw);

  const info = { version, commit: commit(), built: new Date().toISOString(), files: files.length + 1, bytes };
  fs.writeFileSync(path.join(DIST, 'version.json'), JSON.stringify(info, null, 2) + '\n');
  return { files, info, precache };
}

// Every local src/href in the published HTML must exist in dist/
// (relative references resolve against the page's own folder).
function htmlPages(dir = DIST, rel = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) return htmlPages(path.join(dir, e.name), r);
    return e.name.endsWith('.html') ? [r] : [];
  });
}
function checkLinks() {
  const problems = [];
  for (const page of htmlPages()) {
    const html = fs.readFileSync(path.join(DIST, page), 'utf8');
    for (const m of html.matchAll(/\b(?:src|href)="([^"#?]*)[^"]*"/g)) {
      const ref = m[1];
      if (!ref) continue;                                   // "#…" or "?…": the same page
      if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(ref)) continue;
      if (ref.startsWith('/') && !ref.startsWith('/kids-ai-test/')) { problems.push(`${page} → ${ref} (outside the project path)`); continue; }
      const target = ref.startsWith('/kids-ai-test/')
        ? path.join(DIST, ref.slice('/kids-ai-test/'.length))
        : path.join(DIST, path.dirname(page), ref);
      if (!path.resolve(target).startsWith(DIST)) { problems.push(`${page} → ${ref} (outside dist/)`); continue; }
      if (!fs.existsSync(ref.endsWith('/') ? path.join(target, 'index.html') : target)) problems.push(`${page} → ${ref}`);
    }
  }
  return problems;
}

const { info, precache } = build();
console.log(`dist/ built: ${info.files} files, ${(info.bytes / 1024).toFixed(0)} KiB, version ${info.version}, commit ${info.commit.slice(0, 7)}`);
console.log(`offline set: ${precache.length} entries`);
if (process.argv.includes('--check')) {
  const problems = checkLinks();
  if (problems.length) { console.error('Broken local links:\n  ' + problems.join('\n  ')); process.exit(1); }
  console.log('local links: OK');
}
