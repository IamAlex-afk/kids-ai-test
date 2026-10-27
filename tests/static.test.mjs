// Static checks over the real site files: no unexpected external requests,
// no storage bypass, no unsupported promises, consistent age labels,
// working language URLs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'];
const page = (l) => (l === 'en' ? 'index.html' : `${l}.html`);
const jsFiles = fs.readdirSync(new URL('js/', root)).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
const dataFiles = LANGS.map(l => `data/${l}.js`);

test('CSP allows network requests only to the site itself', () => {
  for (const l of LANGS) {
    const csp = read(page(l)).match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
    assert.match(csp, /connect-src 'self';/, page(l));
    assert.doesNotMatch(csp, /worldtimeapi/, page(l));
  }
});

test('no script requests a third-party URL (fetch / XHR / sendBeacon / WebSocket)', () => {
  for (const f of jsFiles) {
    const src = read(f);
    for (const m of src.matchAll(/(fetch|sendBeacon|XMLHttpRequest|WebSocket|EventSource)\s*\(([^)]*)\)/g)) {
      assert.doesNotMatch(m[2], /https?:\/\//, `${f}: ${m[0]}`);
    }
    assert.doesNotMatch(src, /worldtimeapi/, f);
  }
});

test('only js/storage.js touches localStorage/sessionStorage; never clear()', () => {
  for (const f of jsFiles) {
    const src = read(f);
    assert.doesNotMatch(src, /localStorage\.clear|sessionStorage\.clear/, f);
    if (f === 'js/storage.js') continue;
    assert.doesNotMatch(src, /\blocalStorage\b|\bsessionStorage\b/, f);
  }
});

test('storage.js is loaded before every module that stores progress', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    const at = (s) => html.indexOf(`<script src="${s}"></script>`);
    assert.ok(at('js/storage.js') > -1, `${page(l)} loads storage.js`);
    for (const m of ['js/snake.js', 'js/leaderboard.js', 'js/companion.js', 'js/platformer.js', 'js/racing.js', 'js/core.js'])
      assert.ok(at('js/storage.js') < html.indexOf(m), `${page(l)}: storage.js before ${m}`);
  }
});

test('no unsupported promises about the card, trust or comparisons', () => {
  const banned = /Cannot be faked|unforgeable|Trusted by parents|Подделать невозможно|Kann nicht gefälscht|No puede falsificarse|Impossible à falsifier|नकली नहीं बनाया जा सकता|Tidak bisa dipalsukan|Não pode ser falsificad|Taklit edilemez|Không thể làm giả|beat 90%|обошёл 90%|verify\.html|better than most people|больше, чем знает большинство взрослых/;
  for (const f of [...LANGS.map(page), ...jsFiles, ...dataFiles, 'README.md', 'llms.txt', 'ai.txt', 'manifest.json'])
    assert.doesNotMatch(read(f), banned, f);
});

// Parents' FAQ claims checked against the named documents (2026-10):
// EU AI Act — chatbots must disclose AI (Art. 50); "high-risk" = listed uses
// (Annex III), not "any AI that talks to children"; WEF Future of Jobs 2023
// has no "70% of jobs"; Ericsson 1993 is about deliberate practice, not
// retrieval; no "Resnick 2017" study was found.
test('parents\' FAQ: corrected claims do not come back', () => {
  const wrong = /Resnick, 2017|Ericsson, 1993|Ericsson \(1993\)|AI systems interacting with children as high-risk|взаимодействующие с детьми, к группе высокого риска|mit Kindern interagieren, als Hochrisiko|interactúan con niños como de alto riesgo|interagissant avec des enfants comme à haut risque|berinteraksi dengan anak sebagai berisiko tinggi|interagem com crianças como de alto risco|etkileşime giren AI sistemlerini yüksek riskli|tương tác với trẻ em là rủi ro cao|70% of jobs|70% рабочих мест|70% der Arbeitsplätze|70% de los empleos|70% des emplois|70% नौकरियाँ|70% pekerjaan|70% dos empregos|%70'i|70% việc làm/;
  for (const f of [...LANGS.map(page), 'js/parents-faq.js', 'llms.txt'])
    assert.doesNotMatch(read(f), wrong, f);
});

test('age labels use the 5–7 / 8–10 / 11–13 / 14+ scheme', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    const labels = [...html.matchAll(/class="age-label">([^<]+)</g)].map(m => m[1].replace(/\s/g, ''));
    assert.deepEqual(labels, ['5–7', '8–10', '11–13', '14+'], page(l));
    assert.match(html, /"suggestedMinAge": 5/, page(l));
    assert.doesNotMatch(html, /title="[^"]*\b(3–5|6–9|10–13)\b/, page(l));
    assert.doesNotMatch(html, /\b3[–-]17\b|3&#8211;17/, page(l));
  }
  for (const f of dataFiles) {
    const src = read(f);
    assert.doesNotMatch(src, /age_tiny:\s*'3 – 5'|age_child:\s*'6 – 9'|age_teen:\s*'10 – 13'/, f);
  }
});

test('canonical + hreflang: every page lists all 10 languages and x-default', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    const canon = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(canon, 'https://iamalex-afk.github.io/kids-ai-test/' + (l === 'en' ? '' : page(l)));
    const langs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map(m => m[1]).sort();
    assert.deepEqual(langs, [...LANGS, 'x-default'].sort(), page(l));
    assert.match(html, new RegExp(`<html lang="${l === 'pt' ? 'pt-BR' : l}"`), page(l));
  }
});

test('sitemap lists every language URL; Google verification file kept', () => {
  const sm = read('sitemap.xml');
  for (const l of LANGS) assert.ok(sm.includes('<loc>https://iamalex-afk.github.io/kids-ai-test/' + (l === 'en' ? '' : page(l)) + '</loc>'), l);
  assert.match(read('googled8a35f2a8c073799.html'), /google-site-verification: googled8a35f2a8c073799\.html/);
});

test('entry screens: pages match tools/gen-entry.mjs, every language is translated', async () => {
  const { render } = await import(new URL('tools/gen-entry.mjs', root));
  const { T } = await import(new URL('tools/entry-i18n.mjs', root));
  const keys = Object.keys(T.en);
  for (const l of LANGS) {
    const html = read(page(l)).replace(/\r\n/g, '\n');
    assert.equal(render(l, html), html, `${page(l)} is out of date: run node tools/gen-entry.mjs`);
    assert.deepEqual(Object.keys(T[l]), keys, `entry-i18n ${l}: same keys as en`);
    for (const k of ['steps', 'facts', 'ages']) assert.equal(T[l][k].length, T.en[k].length, `${l}.${k}`);
    assert.ok(T[l].h1b.includes(T[l].hl), `${l}: highlighted word is in the title`);
  }
});

test('entry screens: styles and entry.js are wired, no boot overlay', () => {
  for (const l of LANGS) {
    const html = read(page(l));
    assert.match(html, /<body data-age="" class="wk-home">/, page(l));
    for (const css of ['css/main.css', 'css/workshop.css', 'css/entry.css'])
      assert.ok(html.includes(`<link rel="stylesheet" href="${css}">`), `${page(l)} links ${css}`);
    const at = (s) => html.indexOf(`<script src="${s}"></script>`);
    assert.ok(at('js/entry.js') > -1 && at('js/entry.js') < at('js/core.js'), `${page(l)}: entry.js before core.js`);
    assert.doesNotMatch(html, /id="boot"|ACCESS GRANTED|class="top-bar"/, page(l));
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${page(l)}: one h1`);
    for (const x of LANGS) assert.ok(html.includes(`class="lang-opt${x === l ? ' active' : ''}" href="${page(x)}"`), `${page(l)} → ${x}`);
  }
});

test('sitemap: only canonical, indexable published pages; honest lastmod', async () => {
  const { renderAll } = await import(new URL('tools/gen-lessons.mjs', root));
  const lessonFiles = [...renderAll().keys()];
  const sm = read('sitemap.xml');
  const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
  const urls = [...sm.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => m[1]);
  assert.equal(urls.length, LANGS.length + lessonFiles.length, 'language pages + lesson catalogs + lesson pages');
  const allowed = new Set([...LANGS.map(page), ...lessonFiles]);
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Set();
  for (const u of urls) {
    const loc = u.match(/<loc>([^<]+)<\/loc>/)[1];
    assert.ok(!seen.has(loc), `${loc}: listed once`); seen.add(loc);
    let file = loc === SITE ? 'index.html' : loc.slice(SITE.length);
    if (file.endsWith('/')) file += 'index.html';
    assert.ok(allowed.has(file), `${loc}: a language or lesson page (no 404, verification or service files)`);
    const html = read(file);
    assert.equal(html.match(/rel="canonical" href="([^"]+)"/)[1], loc, `${file}: canonical = sitemap URL`);
    assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/i, `${file}: indexable`);
    const lastmod = (u.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
    if (lastmod) {
      assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, `${file}: lastmod format`);
      assert.ok(lastmod <= today, `${file}: lastmod ${lastmod} is not in the future`);
    }
  }
  // Pages that must never be indexed say so themselves
  assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
});

test('lesson pages: match tools/gen-lessons.mjs, one page per lesson in every language', async () => {
  const { renderAll, loadData, AGES, lessonFile } = await import(new URL('tools/gen-lessons.mjs', root));
  const { L } = await import(new URL('tools/lesson-i18n.mjs', root));
  const files = renderAll();
  for (const [rel, body] of files) assert.equal(read(rel).replace(/\r\n/g, '\n'), body, `${rel} is out of date: run node tools/gen-lessons.mjs`);
  const keys = Object.keys(L.en);
  const en = loadData('en');
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(L[l]), keys, `lesson-i18n ${l}: same keys as en`);
    assert.equal(L[l].ages.length, 4, `lesson-i18n ${l}.ages`);
    const data = loadData(l);
    for (const { key, slug } of AGES) {
      // hreflang links the same lesson across languages, so the lists must line up
      assert.equal(data.ages[key].lessons.length, en.ages[key].lessons.length, `${l} ${key}: as many lessons as en`);
      data.ages[key].lessons.forEach((x, i) => assert.ok(files.has(`lessons/${l}/${lessonFile(slug, i + 1)}`), `${l} ${key} ${i + 1}`));
    }
    // the main page links to its catalog
    assert.ok(read(page(l)).includes(`href="lessons/${l}/"`), `${page(l)} links to lessons/${l}/`);
  }
});

test('lesson pages: CSP, language, canonical/hreflang, one h1, no stored or sent answers', async () => {
  const { renderAll } = await import(new URL('tools/gen-lessons.mjs', root));
  const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
  for (const [rel, html] of renderAll()) {
    const l = rel.split('/')[1];
    const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
    assert.match(csp, /connect-src 'self';/, rel);
    assert.match(html, new RegExp(`<html lang="${l === 'pt' ? 'pt-BR' : l}"`), rel);
    const self = SITE + rel.replace(/index\.html$/, '');
    assert.equal(html.match(/rel="canonical" href="([^"]+)"/)[1], self, `${rel}: self canonical`);
    const langs = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    assert.deepEqual(langs.map(m => m[1]).sort(), [...LANGS, 'x-default'].sort(), `${rel}: hreflang`);
    assert.equal(langs.find(m => m[1] === l)[2], self, `${rel}: hreflang to itself`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${rel}: one h1`);
    assert.doesNotMatch(html, /\son[a-z]+="/, `${rel}: no inline handlers`);
    assert.ok(html.includes('<script src="../../js/lesson.js"></script>'), `${rel}: lesson.js`);
    assert.doesNotMatch(html, /js\/storage\.js|js\/core\.js/, `${rel}: no progress storage`);
  }
  const js = read('js/lesson.js');
  assert.doesNotMatch(js, /fetch\(|sendBeacon|XMLHttpRequest|localStorage|sessionStorage|setTimeout\([^)]*(location|href)/, 'lesson.js stores and sends nothing');
  assert.match(js, /localService !== false/, 'lesson.js: installed voices only');
});

test('every page: one h1, heading levels never skip on the way down', () => {
  const skip = new Set(['.git', 'node_modules', 'dist', 'docs', '.github']);
  const walk = (dir) => fs.readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (skip.has(e.name) ? [] : walk(`${dir}${e.name}/`)) : e.name.endsWith('.html') ? [`${dir}${e.name}`] : []);
  const pages = walk('');
  assert.ok(pages.length >= 10, 'pages found');
  for (const p of pages) {
    // comments are matched too (and skipped), so a heading inside one does not count
    const levels = [...read(p).matchAll(/<!--[\s\S]*?-->|<h([1-6])\b/g)].filter((m) => m[1]).map((m) => +m[1]);
    if (!levels.length) continue;
    assert.equal(levels.filter((n) => n === 1).length, 1, `${p}: exactly one h1`);
    assert.equal(levels[0], 1, `${p}: h1 comes first`);
    levels.reduce((prev, n) => { assert.ok(n <= prev + 1, `${p}: h${prev} followed by h${n}`); return n; });
  }
  // the parents' block has its own h2, so its h3 sections do not land under the last FAQ question
  for (const l of LANGS) {
    const src = read(page(l));
    const block = src.slice(src.indexOf('<div class="parent-wrap"'), src.indexOf('<footer'));
    assert.match(block, /^<div class="parent-wrap"[^>]*>\s*<h2 class="parent-h"><button class="parent-toggle"/, `${page(l)}: parents' block starts with its h2`);
    assert.doesNotMatch(block, /<summary><h3>/, `${page(l)}: questions inside the parents' block are h4`);
  }
});
