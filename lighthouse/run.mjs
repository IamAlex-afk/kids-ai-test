// Lighthouse, 3 runs per page (mobile preset, Lighthouse's default), against
// dist/ served locally under /kids-ai-test/. Writes every report (HTML+JSON)
// to out/ and a median table to out/summary.md (also the job summary).
//
// Gate: Accessibility, Best practices and SEO must be 100 in EVERY run (the
// worst run counts, so a flaky 100 fails). Performance is report only.
// Note: python's http.server sends no gzip and no cache headers, so Performance here is a lower bound of GitHub Pages, not equal.
// SEO score ≠ Google ranking; Accessibility score ≠ full accessibility.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8766/kids-ai-test/';
const PAGES = [
  ['home-ru', 'ru.html'],
  ['lesson-ru-8-10-1', 'lessons/ru/8-10-1.html'],
  ['workshop-ru-sorter', 'workshop/ru/sorter.html?age=8-10'],
];
const RUNS = 3;
const CATS = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRICS = ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'];

fs.mkdirSync('out', { recursive: true });
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const rows = [];

for (const [name, path] of PAGES) {
  const runs = [];
  for (let i = 1; i <= RUNS; i++) {
    const base = `out/${name}-run${i}`;
    execFileSync('npx', ['lighthouse', BASE + path, '--quiet', '--output=json', '--output=html',
      `--output-path=${base}`, '--chrome-flags=--headless=new --no-sandbox'], { stdio: 'inherit' });
    const r = JSON.parse(fs.readFileSync(`${base}.report.json`, 'utf8'));
    runs.push({
      cats: Object.fromEntries(CATS.map((c) => [c, Math.round(r.categories[c].score * 100)])),
      m: Object.fromEntries(METRICS.map((k) => [k, r.audits[k].numericValue])),
      ua: r.environment?.hostUserAgent || '',
    });
  }
  rows.push({ name, path, runs,
    cats: Object.fromEntries(CATS.map((c) => [c, median(runs.map((x) => x.cats[c]))])),
    m: Object.fromEntries(METRICS.map((k) => [k, median(runs.map((x) => x.m[k]))])) });
}

const lines = [
  `## Lighthouse (median of ${RUNS} runs, mobile preset, local server without gzip)`,
  '',
  '| page | Performance | Accessibility | Best practices | SEO | LCP, s | CLS | TBT, ms | all runs (P/A/BP/SEO) |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.path} | ${r.cats.performance} | ${r.cats.accessibility} | ${r.cats['best-practices']} | ${r.cats.seo} | ${(r.m['largest-contentful-paint'] / 1000).toFixed(2)} | ${r.m['cumulative-layout-shift'].toFixed(3)} | ${Math.round(r.m['total-blocking-time'])} | ${r.runs.map((x) => CATS.map((c) => x.cats[c]).join('/')).join(' · ')} |`),
  '',
  `Browser: ${rows[0]?.runs[0]?.ua || 'unknown'}`,
];
const GATED = ['accessibility', 'best-practices', 'seo'];
const fails = rows.flatMap((r) => r.runs.flatMap((x, i) => GATED
  .filter((c) => x.cats[c] < 100).map((c) => `${r.path}: ${c} = ${x.cats[c]} (run ${i + 1})`)));
lines.push('', fails.length
  ? `**FAIL** — below 100 in Accessibility/Best practices/SEO:\n${fails.map((f) => `- ${f}`).join('\n')}`
  : '**PASS** — Accessibility, Best practices, SEO = 100 in every run (Performance: report only).');
fs.writeFileSync('out/summary.md', lines.join('\n') + '\n');
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
if (fails.length) process.exit(1);
