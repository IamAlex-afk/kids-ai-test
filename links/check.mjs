// External link check, report only. Collects every external URL from the
// content sources (series, data, scripts, lessons, Workshop and home pages),
// removes duplicates, fetches each one (≤4 at a time, one retry) and writes
// out/report.md (also the job summary) and out/report.json.
//
// Columns: "available" is measured; "on topic" is NOT judged here — the
// report prints the page title next to the text that cites it, for a person
// to compare; "confirms the claim" is always a manual check.
// 403/429/5xx/timeouts mean "could not check", never "deleted". Nothing is
// ever removed or edited automatically. Exit code is always 0.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCES = [
  ['tools/series', /\.mjs$/], ['tools/articles', /\.mjs$/], ['data', /\.js$/], ['js', /\.js$/],
  ...fs.readdirSync(path.join(ROOT, 'lessons')).map((l) => [`lessons/${l}`, /\.html$/]),
  ...fs.readdirSync(path.join(ROOT, 'articles')).map((l) => [`articles/${l}`, /\.html$/]),
  ...fs.readdirSync(path.join(ROOT, 'workshop')).filter((d) => fs.statSync(path.join(ROOT, 'workshop', d)).isDirectory())
    .map((l) => [`workshop/${l}`, /\.html$/]),
  ['.', /\.html$/],
];
// Own site, XML/JSON-LD namespaces — not citations.
const SKIP = /^https?:\/\/(iamalex-afk\.github\.io|schema\.org|www\.w3\.org)(\/|$)/;
const CONCURRENCY = 4;
const TIMEOUT_MS = 20000;
const UA = 'Mozilla/5.0 (compatible; kids-ai-test-link-check; +https://github.com/IamAlex-afk/kids-ai-test)';

// &amp; last, so "&amp;lt;" stays "&lt;" (no double unescaping).
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// Plain text for the report: no tags, and no stray < > left to form one.
const plain = (s) => s.replace(/<[^>]*>/g, ' ').replace(/[<>]/g, '');
const urls = new Map(); // url -> { files:Set, texts:Set }
for (const [dir, re] of SOURCES) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const name of fs.readdirSync(abs).filter((n) => re.test(n))) {
    const rel = path.posix.join(dir, name).replace(/^\.\//, '');
    const src = fs.readFileSync(path.join(abs, name), 'utf8');
    const seen = new Map();
    for (const m of src.matchAll(/<a\s[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]{0,300}?)<\/a>/g)) {
      seen.set(decode(m[1]), plain(decode(plain(m[2]))));
    }
    for (const m of src.matchAll(/https?:\/\/[^\s"'<>`)\\]+/g)) {
      const u = decode(m[0]).replace(/[.,;:]+$/, '');
      if (!seen.has(u)) seen.set(u, '');
    }
    for (const [u, text] of seen) {
      if (SKIP.test(u)) continue;
      if (!urls.has(u)) urls.set(u, { files: new Set(), texts: new Set() });
      urls.get(u).files.add(rel);
      if (text) urls.get(u).texts.add(text.slice(0, 160));
    }
  }
}

async function probe(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8' } });
    let title = '';
    const type = res.headers.get('content-type') || '';
    if (type.includes('html') && res.body) {
      let html = '';
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (html.length < 262144) {
        const { done, value } = await reader.read();
        if (done) break;
        html += dec.decode(value, { stream: true });
        if (/<\/title>/i.test(html)) break;
      }
      reader.cancel().catch(() => {});
      title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    } else {
      res.body?.cancel().catch(() => {});
      if (type.includes('pdf')) title = '(PDF)';
    }
    return { status: res.status, final: res.url, title: title.slice(0, 160) };
  } catch (e) {
    return { status: 0, error: e.name === 'AbortError' ? `timeout ${TIMEOUT_MS / 1000}s` : String(e.cause?.code || e.message) };
  } finally {
    clearTimeout(timer);
  }
}
const verdict = (r) => {
  if (r.status >= 200 && r.status < 300) return 'available';
  if (r.status === 404 || r.status === 410) return 'not found — check by hand';
  return 'could not check';
};

const list = [...urls.keys()].sort();
const results = new Map();
let next = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < list.length) {
    const url = list[next++];
    let r = await probe(url);
    if (verdict(r) !== 'available') { await new Promise((ok) => setTimeout(ok, 3000)); r = await probe(url); }
    results.set(url, r);
  }
}));

const rows = list.map((url) => ({ url, ...results.get(url), verdict: verdict(results.get(url)),
  files: [...urls.get(url).files], texts: [...urls.get(url).texts] }));
const cell = (s) => String(s || '').replace(/[<>]/g, '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
const count = (v) => rows.filter((r) => r.verdict === v).length;
const table = (rs) => [
  '| URL | HTTP | available | page title (on topic? — compare by hand) | cited as | confirms the claim | where |',
  '|---|---|---|---|---|---|---|',
  ...rs.map((r) => `| ${cell(r.url)}${r.final && r.final !== r.url ? `<br>→ ${cell(r.final)}` : ''} | ${r.status || cell(r.error)} | ${r.verdict} | ${cell(r.title)} | ${cell(r.texts.join(' · '))} | manual | ${r.files.length} file(s): ${cell(r.files.slice(0, 3).join(', '))}${r.files.length > 3 ? ', …' : ''} |`),
];
const problems = rows.filter((r) => r.verdict !== 'available');
const lines = [
  `## External links (${rows.length} unique, ≤${CONCURRENCY} at a time, one retry)`,
  '',
  `available: ${count('available')} · not found (404/410): ${count('not found — check by hand')} · could not check (403/429/5xx/timeout): ${count('could not check')}`,
  '',
  '"Could not check" is not "deleted". Nothing is changed automatically.',
  '',
  ...(problems.length ? ['### Needs a look', '', ...table(problems), ''] : []),
  '### All links', '', ...table(rows),
];
fs.mkdirSync(path.join(import.meta.dirname, 'out'), { recursive: true });
fs.writeFileSync(path.join(import.meta.dirname, 'out/report.md'), lines.join('\n') + '\n');
fs.writeFileSync(path.join(import.meta.dirname, 'out/report.json'), JSON.stringify(rows, null, 2) + '\n');
console.log(lines.slice(0, 3).join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
