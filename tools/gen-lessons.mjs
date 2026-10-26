// Static lesson pages: one page per lesson and a catalog per language, so
// every lesson has its own address that opens directly and can be found by
// search. Lessons come from data/<lang>.js (the same ones the main page
// shows), page text from tools/lesson-i18n.mjs, the header from
// tools/gen-entry.mjs. Behaviour: js/lesson.js, styles: css/lesson.css.
//
//   lessons/<lang>/index.html          catalog of all lessons by age
//   lessons/<lang>/<age>-<n>.html      one lesson (age: 5-7, 8-10, 11-13, 14-plus)
//
// Also rewrites the lesson part of sitemap.xml (between the LESSONS markers).
// Never edit the generated files by hand.
//
//   node tools/gen-lessons.mjs           write lessons/ and sitemap.xml
//   node tools/gen-lessons.mjs --check   exit 1 if anything is out of date

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { header, LANGS, pageOf, esc } from './gen-entry.mjs';
import { T } from './entry-i18n.mjs';
import { L } from './lesson-i18n.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
// Date the lesson pages last changed in substance. Set by hand: a build must
// not pretend that unchanged pages are new.
export const LESSONS_LASTMOD = '2026-10-26';
export const AGES = [
  { key: 'tiny', slug: '5-7' },
  { key: 'child', slug: '8-10' },
  { key: 'teen', slug: '11-13' },
  { key: 'adult', slug: '14-plus' },
];
const HTML_LANG = { pt: 'pt-BR' };
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none';";

export const lessonFile = (slug, n) => `${slug}-${n}.html`;
const url = (l, file = '') => `${SITE}lessons/${l}/${file}`;
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k]);

export function loadData(l) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data', `${l}.js`), 'utf8'), ctx);
  return ctx.window.LANG_DATA;
}

function snippet(text, max = 155) {
  const s = String(text).replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[\s,;:—–-]+$/, '') + '…';
}

function head(l, { title, desc, file }) {
  const alt = LANGS.map((x) => `  <link rel="alternate" hreflang="${x}" href="${url(x, file)}">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${HTML_LANG[l] || l}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url(l, file)}">
${alt}
  <link rel="alternate" hreflang="x-default" href="${url('en', file)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url(l, file)}">
  <meta property="og:image" content="${SITE}og.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="../../favicon.ico" sizes="48x48">
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../apple-touch-icon.png">
  <link rel="stylesheet" href="../../css/workshop.css">
  <link rel="stylesheet" href="../../css/lesson.css">`;
}

function crumbsLd(items) {
  const list = items.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: href }));
  return `  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list }).replace(/</g, '\\u003c')}</script>`;
}

// The last item is marked as the current page only when it is this page (a catalog).
function crumbs(l, items, lastIsPage = false) {
  return `    <nav class="wk-crumbs" aria-label="${esc(L[l].crumbs)}">
      <ol>
${items.map(([name, href], i) => `        <li><a href="${href}"${lastIsPage && i === items.length - 1 ? ' aria-current="page"' : ''}>${esc(name)}</a></li>`).join('\n')}
      </ol>
    </nav>`;
}

function footer(l) {
  const t = L[l];
  return `<footer class="wk-foot">
  <div class="wk-foot-in">
    <p>${esc(t.privacy)}</p>
    <p><a href="../../${pageOf(l)}">${esc(t.play)}</a></p>
    <p><a href="../../${pageOf(l)}#about">${esc(T[l].about)}</a></p>
  </div>
</footer>
<script src="../../js/lesson.js"></script>
</body>
</html>
`;
}

function check(l, q, qi) {
  const t = L[l];
  const id = `chk-${qi + 1}`;
  const opts = q.options.map((o, i) => `        <li><button type="button" class="wk-opt" data-i="${i}" disabled>${esc(o)}</button></li>`).join('\n');
  return `    <div class="wk-q-block" data-correct="${q.correct}">
      <p class="wk-check-q" id="${id}">${esc(q.q)}</p>
      <ol class="wk-opts" aria-labelledby="${id}">
${opts}
      </ol>
      <p class="wk-fb" id="${id}-fb" role="status" aria-live="polite"></p>
      <button type="button" class="wk-retry" hidden>${esc(t.retry)}</button>
      <details class="wk-reveal">
        <summary>${esc(t.reveal)}</summary>
        <p><b>${esc(t.answer)}</b> ${esc(q.options[q.correct])}</p>
        <p class="wk-explain">${esc(q.explanation || '')}</p>
      </details>
    </div>`;
}

function lessonPage(l, ageIdx, lessons, i) {
  const t = L[l], age = AGES[ageIdx], x = lessons[i];
  const n = i + 1, m = lessons.length, file = lessonFile(age.slug, n);
  const ageName = t.ages[ageIdx];
  const title = `${x.title} — ${t.lessonWord}, ${ageName} | Kids AI Test`;
  const home = `../../${pageOf(l)}`;
  const items = [[t.home, home], [t.all, './'], [ageName, `./#age-${age.slug}`]];
  const ldItems = [[t.home, SITE + (l === 'en' ? '' : pageOf(l))], [t.all, url(l)], [ageName, url(l) + `#age-${age.slug}`]];
  const prev = i > 0 ? `<a class="wk-pg wk-pg-prev" rel="prev" href="${lessonFile(age.slug, n - 1)}">${esc(t.prev)}</a>` : '';
  const next = i < m - 1 ? `<a class="wk-pg wk-pg-next" rel="next" href="${lessonFile(age.slug, n + 1)}">${esc(t.next)}</a>` : `<p class="wk-last">${esc(t.last)}</p>`;
  const src = x.sourceUrl
    ? `<p class="wk-source">${esc(t.source)}: <a href="${esc(x.sourceUrl)}" rel="noopener" target="_blank">${esc(x.source || x.sourceUrl)}</a></p>`
    : x.source ? `<p class="wk-source">${esc(t.source)}: ${esc(x.source)}</p>`
      : `<p class="wk-source wk-source-none">${esc(t.noSource)}</p>`;
  return `${head(l, { title, desc: snippet(x.text), file })}
${crumbsLd(ldItems)}
</head>
<body class="wk-home wk-page" data-age="${age.key}" data-right="${esc(t.right)}" data-wrong="${esc(t.wrong)}">
${header(l, { home, langHref: (y) => `../${y}/${file}` })}
<main id="main" class="wk-lesson">
${crumbs(l, items)}
  <article class="wk-card" aria-labelledby="wk-lesson-title">
    <p class="wk-meta"><span>${esc(fill(t.lessonOf, { n, m }))}</span><span>${esc(ageName)}</span></p>
    <div class="wk-prog" aria-hidden="true"><i style="width:${Math.round((n / m) * 100)}%"></i></div>
    <h1 class="wk-lesson-title" id="wk-lesson-title" data-speak><span class="wk-icon" aria-hidden="true">${esc(x.icon || '🤖')}</span> ${esc(x.title)}</h1>
${age.key === 'tiny' ? `    <p class="wk-tiny-note">${esc(t.tinyNote)}</p>\n` : ''}    <div class="wk-voice" hidden>
      <button type="button" class="wk-btn wk-listen">${esc(t.listen)}</button>
      <button type="button" class="wk-btn wk-stop" disabled>${esc(t.stop)}</button>
    </div>
    <p class="wk-novoice" hidden>${esc(t.noVoice)}</p>
    <p class="wk-text" data-speak>${esc(x.text)}</p>
${x.example ? `    <aside class="wk-example" aria-labelledby="wk-ex-h">
      <h2 id="wk-ex-h">${esc(t.example)}</h2>
      <p data-speak>${esc(x.example)}</p>
    </aside>\n` : ''}${(x.miniTest || []).length ? `    <section class="wk-check" aria-labelledby="wk-chk-h">
      <h2 id="wk-chk-h">${esc(t.check)}</h2>
${x.miniTest.map((q, qi) => check(l, q, qi)).join('\n')}
    </section>\n` : ''}    ${src}
  </article>
  <nav class="wk-pager" aria-label="${esc(t.pager)}">
    ${prev}
    <a class="wk-pg wk-pg-finish" href="./#age-${age.slug}">${esc(t.finish)}</a>
    ${next}
  </nav>
</main>
${footer(l)}`;
}

function catalogPage(l, data) {
  const t = L[l];
  const home = `../../${pageOf(l)}`;
  const sections = AGES.map((age, ai) => {
    const lessons = data.ages[age.key].lessons;
    return `  <section class="wk-cat-age" id="age-${age.slug}" data-age="${age.key}" aria-labelledby="h-${age.slug}">
    <h2 id="h-${age.slug}">${esc(t.ages[ai])}</h2>
    <p class="wk-cat-d">${esc(T[l].ages[ai])} · ${esc(fill(t.lessonsCount, { n: lessons.length }))}</p>
    <ol class="wk-cat-list">
${lessons.map((x, i) => `      <li><a href="${lessonFile(age.slug, i + 1)}"><span class="wk-icon" aria-hidden="true">${esc(x.icon || '🤖')}</span> ${esc(x.title)}</a></li>`).join('\n')}
    </ol>
  </section>`;
  }).join('\n');
  return `${head(l, { title: `${t.catTitle} | Kids AI Test`, desc: t.catDesc, file: '' })}
${crumbsLd([[t.home, SITE + (l === 'en' ? '' : pageOf(l))], [t.all, url(l)]])}
</head>
<body class="wk-home wk-page">
${header(l, { home, langHref: (y) => `../${y}/` })}
<main id="main" class="wk-lesson wk-catalog">
${crumbs(l, [[t.home, home], [t.all, './']], true)}
  <h1 class="wk-cat-title">${esc(t.catTitle)}</h1>
  <p class="wk-cat-lead">${esc(t.catLead)}</p>
  <p class="wk-cat-play"><a href="${home}">${esc(t.play)}</a></p>
${sections}
</main>
${footer(l)}`;
}

// Every file under lessons/ that the generator owns, with its content.
export function renderAll() {
  const out = new Map();
  for (const l of LANGS) {
    const data = loadData(l);
    out.set(`lessons/${l}/index.html`, catalogPage(l, data));
    AGES.forEach((age, ai) => {
      const lessons = data.ages[age.key].lessons;
      lessons.forEach((_, i) => out.set(`lessons/${l}/${lessonFile(age.slug, i + 1)}`, lessonPage(l, ai, lessons, i)));
    });
  }
  return out;
}

export function sitemapBlock(files) {
  const urls = [...files.keys()].map((f) => SITE + f.replace(/index\.html$/, ''));
  return urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${LESSONS_LASTMOD}</lastmod>\n  </url>`).join('\n');
}

export function renderSitemap(xml, files) {
  const re = /(<!-- LESSONS: generated by tools\/gen-lessons\.mjs -->)[\s\S]*?(<!-- \/LESSONS -->)/;
  if (!re.test(xml)) throw new Error('sitemap.xml: missing LESSONS markers');
  return xml.replace(re, `$1\n${sitemapBlock(files)}\n  $2`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes('--check');
  const files = renderAll();
  const stale = [];
  const write = (rel, body) => {
    const abs = path.join(ROOT, rel);
    // CRLF from a Windows checkout (core.autocrlf) is not a difference
    const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n') : null;
    if (cur === body) return;
    if (checkOnly) { stale.push(rel); return; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  };
  for (const [rel, body] of files) write(rel, body);
  // Pages the generator no longer produces (a lesson was removed) are stale too.
  for (const l of LANGS) {
    const dir = path.join(ROOT, 'lessons', l);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const rel = `lessons/${l}/${name}`;
      if (files.has(rel)) continue;
      if (checkOnly) stale.push(rel + ' (not generated any more)');
      else fs.rmSync(path.join(ROOT, rel));
    }
  }
  write('sitemap.xml', renderSitemap(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').replace(/\r\n/g, '\n'), files));
  if (checkOnly && stale.length) { console.error('Out of date (run node tools/gen-lessons.mjs):\n  ' + stale.join('\n  ')); process.exit(1); }
  console.log(checkOnly ? `lesson pages up to date (${files.size})` : `lesson pages written (${files.size})`);
}
