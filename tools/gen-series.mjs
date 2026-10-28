// Workshop activities (the new series): one page per activity per language,
// a catalog per language. Content and status come from the registry
// tools/series.mjs; interface text from tools/series/ui.mjs; header from
// tools/gen-entry.mjs. Behaviour: js/workshop.js + js/workshop-<kind>.js,
// styles: css/workshop.css + css/lesson.css (no separate design system).
//
//   workshop/<lang>/index.html     catalog
//   workshop/<lang>/<id>.html      activity; ?age=5-7|8-10|11-13|14-plus sets
//                                  the starting difficulty (one page, not four)
//
// Only languages the registry lists get pages; hreflang links only those.
// Also rewrites the WORKSHOP block of sitemap.xml. Never edit outputs by hand.
//
//   node tools/gen-series.mjs           write workshop/ and sitemap.xml
//   node tools/gen-series.mjs --check   exit 1 if anything is out of date

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { header, pageOf, esc } from './gen-entry.mjs';
import { SERIES, SERIES_LANGS, SERIES_LASTMOD } from './series.mjs';
import { UI } from './series/ui.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none';";
const AGE_SLUGS = [['tiny', '5-7'], ['child', '8-10'], ['teen', '11-13'], ['adult', '14-plus']];
const url = (l, file = '') => `${SITE}workshop/${l}/${file}`;
// JSON inside <script>: no "</script>" break-out, no HTML comment tricks
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function head(l, { title, desc, file, langs, wait = false }) {
  const alt = langs.map((x) => `  <link rel="alternate" hreflang="${x}" href="${url(x, file)}">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${l}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url(l, file)}">
${alt}
  <link rel="alternate" hreflang="x-default" href="${url(langs.includes('en') ? 'en' : langs[0], file)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url(l, file)}">
  <meta property="og:image" content="${SITE}og.png">
  <link rel="icon" href="../../favicon.ico" sizes="48x48">
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../css/workshop.css">
  <link rel="stylesheet" href="../../css/lesson.css">${wait ? `
  <script>document.documentElement.classList.add('wk-wait')</script>` : ''}`;
}

// Language menu: the same activity where it exists, else that language's lessons.
const langHref = (file) => (x) => (SERIES_LANGS.includes(x) ? `../${x}/${file}` : `../../lessons/${x}/`);

function crumbs(l, items) {
  return `    <nav class="wk-crumbs" aria-label="${esc(UI[l].crumbs)}">
      <ol>
${items.map(([name, href], i) => `        <li><a href="${href}"${i === items.length - 1 && href === './' ? ' aria-current="page"' : ''}>${esc(name)}</a></li>`).join('\n')}
      </ol>
    </nav>`;
}

const list = (items) => `<ul>\n${items.map((s) => `          <li>${esc(s)}</li>`).join('\n')}\n        </ul>`;

function activityPage(l, s, idx) {
  const u = UI[l], t = s.text[l].common, file = s.file;
  const home = `../../${pageOf(l)}`;
  const ages = AGE_SLUGS.map(([k, slug]) => `      <li><a href="${file}?age=${slug}" data-slug="${slug}"${k === 'child' ? ' aria-current="true"' : ''}>${esc(u.ages[k])}</a></li>`).join('\n');
  const nextS = SERIES[(idx + 1) % SERIES.length];
  const next = [
    { href: file },                                   // repeat (age kept by the engine via the switcher)
    { href: nextS.file },
    { href: `../../lessons/${l}/` },
  ];
  const data = { kind: s.kind, defaultAge: 'child', data: s.data, ui: u, next,
    text: Object.fromEntries(['common', 'tiny', 'child', 'teen', 'adult'].map((k) => [k, s.text[l][k] || {}])) };
  const a = t.adult;
  const explain = s.staticKeys.map((k) => `      <p>${esc(t[k])}</p>`).join('\n');
  const sources = s.sources.map((x) => `        <li><a href="${esc(x.url)}" rel="noopener" target="_blank">${esc(x.title)}</a><br><span class="wk-supports">${esc(u.supports)}: ${esc(x.supports[l])}</span></li>`).join('\n');
  return `${head(l, { title: `${t.title} — ${u.series} | Kids AI Test`, desc: t.desc, file, langs: s.langs, wait: true })}
</head>
<body class="wk-home wk-page wk-workshop" data-age="child">
${header(l, { home, langHref: langHref(file) })}
<main id="main" class="wk-lesson">
${crumbs(l, [[u.home, home], [u.catalog, './'], [t.title, file]])}
  <article class="wk-card" aria-labelledby="wk-act-title">
    <h1 class="wk-lesson-title" id="wk-act-title">${esc(t.title)}</h1>
    <nav class="wk-ageswitch" aria-label="${esc(u.ageLabel)}">
      <p>${esc(u.ageLabel)}:</p>
      <ol>
${ages}
      </ol>
    </nav>
${s.sample ? `    <p class="wk-sample">${esc(u.sampleNote)}</p>\n` : ''}    <section class="wk-goalbox" aria-labelledby="wk-goal-h">
      <h2 id="wk-goal-h">${esc(u.goalH)}</h2>
      <p>${esc(t.goal || s.text[l].child.goal)}</p>
    </section>
    <noscript><p class="wk-novoice">${esc(t.noJs)}</p></noscript>
    <section class="wk-app" id="wk-app" aria-live="off"></section>
    <details class="wk-explain-all">
      <summary>${esc(u.explainH)}</summary>
${explain}
    </details>
  </article>

  <section class="wk-card wk-adult" aria-labelledby="wk-adult-h">
    <h2 id="wk-adult-h">${esc(u.adultH)}</h2>
    <h3>${esc(u.adultGoal)}</h3>
    <p>${esc(a.goal)}</p>
    <h3>${esc(u.adultQuestions)}</h3>
        ${list(a.questions)}
    <h3>${esc(u.adultMis)}</h3>
    <p>${esc(a.misconception)}</p>
    <h3>${esc(u.adultSigns)}</h3>
        ${list(a.signs)}
    <h3>${esc(u.adultMethod)}</h3>
    <p>${esc(a.method)}</p>
  </section>

  <section class="wk-card wk-print" aria-labelledby="wk-print-h">
    <h2 id="wk-print-h">${esc(u.printH)}</h2>
    <p>${esc(a.print.task)}</p>
    <button type="button" class="wk-btn" data-print hidden>${esc(u.printBtn)}</button>
    <details class="wk-print-answers" open>
      <summary>${esc(u.printAnswers)}</summary>
      <p>${esc(a.print.answers)}</p>
    </details>
  </section>

  <section class="wk-card wk-sources" aria-labelledby="wk-src-h">
    <h2 id="wk-src-h">${esc(u.sourcesH)}</h2>
    <ol>
${sources}
    </ol>
    <p class="wk-review">${esc(u.review)}</p>
  </section>

  <nav class="wk-pager" aria-label="${esc(u.other)}">
    <a class="wk-pg" href="./">${esc(u.catalog)}</a>
    <a class="wk-pg wk-pg-next" href="${nextS.file}">${esc(nextS.text[l].common.title)} →</a>
  </nav>
</main>
<footer class="wk-foot">
  <div class="wk-foot-in">
    <p>${esc(u.privacy)}</p>
    <p><a href="../../lessons/${l}/">${esc(u.lessons)}</a></p>
  </div>
</footer>
<script type="application/json" id="wk-data">${jsonForScript(data)}</script>
<script src="../../js/lesson.js"></script>
${s.scripts.map((f) => `<script src="../../js/${f}"></script>`).join('\n')}
</body>
</html>
`;
}

function catalogPage(l) {
  const u = UI[l], home = `../../${pageOf(l)}`;
  const items = SERIES.filter((s) => s.langs.includes(l)).map((s) => {
    const t = s.text[l].common;
    return `      <li class="wk-cat-item"><a href="${s.file}"><b>${esc(t.title)}</b></a><span class="wk-cat-d">${esc(s.text[l].child.goal || t.goal)}</span></li>`;
  }).join('\n');
  return `${head(l, { title: `${u.series} | Kids AI Test`, desc: u.seriesLead, file: '', langs: SERIES_LANGS })}
</head>
<body class="wk-home wk-page">
${header(l, { home, langHref: langHref('') })}
<main id="main" class="wk-lesson wk-catalog">
${crumbs(l, [[u.home, home], [u.catalog, './']])}
  <h1 class="wk-cat-title">${esc(u.series)}</h1>
  <p class="wk-cat-lead">${esc(u.seriesLead)}</p>
  <ol class="wk-cat-list">
${items}
  </ol>
  <p class="wk-cat-play"><a href="../../lessons/${l}/">${esc(u.lessons)}</a></p>
</main>
<footer class="wk-foot">
  <div class="wk-foot-in"><p>${esc(u.privacy)}</p></div>
</footer>
<script src="../../js/lesson.js"></script>
</body>
</html>
`;
}

export function renderAll() {
  const out = new Map();
  for (const l of SERIES_LANGS) {
    out.set(`workshop/${l}/index.html`, catalogPage(l));
    SERIES.forEach((s, i) => { if (s.langs.includes(l)) out.set(`workshop/${l}/${s.file}`, activityPage(l, s, i)); });
  }
  return out;
}

export function renderSitemap(xml, files) {
  const re = /(<!-- WORKSHOP: generated by tools\/gen-series\.mjs -->)[\s\S]*?(<!-- \/WORKSHOP -->)/;
  if (!re.test(xml)) throw new Error('sitemap.xml: missing WORKSHOP markers');
  const urls = [...files.keys()].map((f) => SITE + f.replace(/index\.html$/, ''));
  const block = urls.map((u) => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${SERIES_LASTMOD}</lastmod>\n  </url>`).join('\n');
  return xml.replace(re, `$1\n${block}\n  $2`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const checkOnly = process.argv.includes('--check');
  const files = renderAll();
  const stale = [];
  const write = (rel, body) => {
    const abs = path.join(ROOT, rel);
    const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n') : null;
    if (cur === body) return;
    if (checkOnly) { stale.push(rel); return; }
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, body);
  };
  for (const [rel, body] of files) write(rel, body);
  for (const l of SERIES_LANGS) {
    const dir = path.join(ROOT, 'workshop', l);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const rel = `workshop/${l}/${name}`;
      if (files.has(rel)) continue;
      if (checkOnly) stale.push(rel + ' (not generated any more)'); else fs.rmSync(path.join(ROOT, rel));
    }
  }
  write('sitemap.xml', renderSitemap(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').replace(/\r\n/g, '\n'), files));
  if (checkOnly && stale.length) { console.error('Out of date (run node tools/gen-series.mjs):\n  ' + stale.join('\n  ')); process.exit(1); }
  console.log(checkOnly ? `workshop pages up to date (${files.size})` : `workshop pages written (${files.size})`);
}
