// Teacher materials: teachers/<lang>/index.html (hub) + age-<slug>.html (4 lesson plans, 45 min)
// for every language that has texts in tools/teachers/texts.mjs. No scripts. Also rewrites the
// TEACHERS block of sitemap.xml.
//   node tools/gen-teachers.mjs           write
//   node tools/gen-teachers.mjs --check   exit 1 if anything is out of date
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { header, pageOf, esc, fitTitle, metaDesc, authorLine } from './gen-entry.mjs';
import { T } from './entry-i18n.mjs';
import { L } from './lesson-i18n.mjs';
import { TT, TEACHERS_LASTMOD, AGE_SLUGS } from './teachers/texts.mjs';
import { lessonHref } from './gen-lessons.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://iamalex-afk.github.io/kids-ai-test/';
const HTML_LANG = { pt: 'pt-BR' };
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none';";
export const TEACHERS_LANGS = ['en', 'ru', 'de', 'es', 'fr', 'hi', 'id', 'pt', 'tr', 'vi'].filter((l) => TT[l]);
const fileOf = (slug) => (slug ? `age-${slug}.html` : '');
const url = (l, slug) => `${SITE}teachers/${l}/${fileOf(slug)}`;
const ld = (o) => `  <script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const ul = (items, tag = 'ul') => `    <${tag}>\n${items.map((x) => `      <li>${esc(x)}</li>`).join('\n')}\n    </${tag}>`;
const ext = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;

function head(l, slug, title, desc, json) {
  const alt = TEACHERS_LANGS.map((x) => `  <link rel="alternate" hreflang="${x}" href="${url(x, slug)}">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${HTML_LANG[l] || l}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${CSP}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url(l, slug)}">
${alt}
  <link rel="alternate" hreflang="x-default" href="${url('en', slug)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url(l, slug)}">
  <meta property="og:image" content="${SITE}og.png">
  <link rel="icon" href="../../favicon.ico" sizes="48x48">
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../css/workshop.css">
  <link rel="stylesheet" href="../../css/lesson.css">
  <link rel="stylesheet" href="../../css/article.css">
  <link rel="stylesheet" href="../../css/teachers.css">
${ld(json)}
</head>`;
}

function shell(l, slug, crumbs, body, hub = false) {
  const t = TT[l];
  const home = `../../${pageOf(l)}`;
  const langHref = (y) => (TT[y] ? `../${y}/${fileOf(slug)}` : `../../${pageOf(y)}`);
  const trail = [`<li><a href="${home}">${esc(L[l].home)}</a></li>`, ...crumbs].join('');
  return `<body class="wk-home wk-page">
${header(l, { home, langHref })}
<main id="main" class="wk-lesson ${hub ? 'wk-catalog' : 'ar-main'} tc-main">
  <nav class="wk-crumbs" aria-label="${esc(L[l].crumbs)}"><ol>${trail}</ol></nav>
  <article class="ar-article${hub ? ' tc-hub' : ''}">
${body}
    <p class="tc-made"><small>${esc(t.ui.made)}</small></p>
    <p class="tc-disclaimer"><small>${esc(t.ui.disclaimer)}</small></p>
    <p><small>${esc(t.ui.updated)}: <time datetime="${TEACHERS_LASTMOD}">${TEACHERS_LASTMOD}</time></small></p>
  </article>
</main>
<footer class="wk-foot">
  <div class="wk-foot-in">
    <p><a href="../../lessons/${l}/">${esc(L[l].all)}</a></p>
    <p><a href="../../privacy/${l}/">${esc(t.ui.privacy)}</a></p>
    <p><a href="../../${pageOf(l)}#about">${esc(T[l].about)}</a></p>
    ${authorLine(T[l], l)}
  </div>
</footer>
</body>
</html>
`;
}

function hub(l) {
  const t = TT[l];
  const h = t.hub;
  const title = fitTitle(h.title);
  const desc = metaDesc(h.desc, h.h1);
  // Hub card = the age card of the lessons catalog, same age colours.
  const TONE = { '5-7': 'tiny', '8-10': 'child', '11-13': 'teen', '14-plus': 'adult' };
  const cards = AGE_SLUGS.map((s) => {
    const p = t.plans[s];
    return `  <section class="wk-cat-age" data-age="${TONE[s]}">
    <h2><a href="${fileOf(s)}">${esc(p.grade)} →</a></h2>
    <p class="wk-cat-d">${esc(p.card)}</p>
  </section>`;
  }).join('\n');
  const json = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: h.h1, description: desc,
    inLanguage: HTML_LANG[l] || l, url: url(l), dateModified: TEACHERS_LASTMOD, isAccessibleForFree: true,
    hasPart: AGE_SLUGS.map((s) => ({ '@type': 'LearningResource', name: t.plans[s].h1, url: url(l, s) })),
  };
  const body = `    <h1 class="wk-cat-title">${esc(h.h1)}</h1>
    <div class="wk-hub-text">
${h.intro.map((p) => `    <p>${esc(p)}</p>`).join('\n')}
    <h2>${esc(h.plansH)}</h2>
    </div>
${cards}
    <section class="wk-hub-text"><h2>${esc(h.howH)}</h2>
${ul(h.howItems)}
    </section>
    <section class="wk-hub-text"><h2>${esc(h.basisH)}</h2>
    <ul>
${h.basis.map((b) => `      <li>${esc(b.text)} ${ext(b.url, b.link)}</li>`).join('\n')}
    </ul>
    </section>
    <section class="wk-hub-text"><h2>${esc(h.whyH)}</h2>
      <p>${esc(h.whyText)}</p>
    </section>
    <section class="wk-hub-text"><h2>${esc(h.printH)}</h2>
      <p>${esc(h.printText)}</p>
    </section>`;
  return `${head(l, '', title, desc, json)}
${shell(l, '', [`<li><a href="./" aria-current="page">${esc(h.h1)}</a></li>`], body, true)}`;
}

function plan(l, s) {
  const t = TT[l];
  const u = t.ui;
  const p = t.plans[s];
  const title = fitTitle(p.title);
  const desc = metaDesc(p.desc, p.h1);
  const lesson = `../../lessons/${l}/${lessonHref(p.lesson)}`;
  const json = {
    '@context': 'https://schema.org', '@type': 'LearningResource', name: p.h1, description: desc,
    inLanguage: HTML_LANG[l] || l, url: url(l, s), dateModified: TEACHERS_LASTMOD, isAccessibleForFree: true,
    learningResourceType: u.lrType, educationalLevel: p.grade, timeRequired: 'PT45M',
    audience: { '@type': 'EducationalAudience', educationalRole: 'teacher' },
  };
  const steps = p.steps.map(([min, text]) => `      <li><b>${esc(min)} ${esc(u.min)}.</b> ${esc(text)}</li>`).join('\n');
  const body = `    <h1 class="wk-cat-title">${esc(p.h1)}</h1>
    <p class="tc-meta"><span>${esc(p.grade)}</span> · <span>45 ${esc(u.min)}</span></p>
    <section><h2>${esc(u.goal)}</h2>
      <p>${esc(p.goal)}</p>
      <p><small>${esc(p.ideas)}</small></p>
    </section>
    <section><h2>${esc(u.need)}</h2>
${ul(p.need)}
      <p><a href="${lesson}">${esc(u.openLesson)}: ${esc(p.lessonTitle)} →</a></p>
    </section>
    <section><h2>${esc(u.steps)}</h2>
    <ol class="tc-steps">
${steps}
    </ol>
    </section>
    <section><h2>${esc(u.questions)}</h2>
${ul(p.questions)}
    </section>
    <section><h2>${esc(u.check)}</h2>
      <p>${esc(p.check)}</p>
    </section>
    <section><h2>${esc(u.diff)}</h2>
${ul(p.diff)}
    </section>
    <section class="tc-parents"><h2>${esc(u.parents)}</h2>
      <p>${esc(p.parents)}</p>
    </section>
    <section><h2>${esc(u.sources)}</h2>
    <ul>
${p.sources.map((x) => `      <li>${ext(x.url, x.text)}</li>`).join('\n')}
    </ul>
    </section>
    <p><a href="./">← ${esc(u.allPlans)}</a></p>`;
  return `${head(l, s, title, desc, json)}
${shell(l, s, [`<li><a href="./">${esc(t.hub.h1)}</a></li>`, `<li><a href="${fileOf(s)}" aria-current="page">${esc(p.grade)}</a></li>`], body)}`;
}

export function renderAll() {
  const out = new Map();
  for (const l of TEACHERS_LANGS) {
    out.set(`teachers/${l}/index.html`, hub(l));
    for (const s of AGE_SLUGS) out.set(`teachers/${l}/${fileOf(s)}`, plan(l, s));
  }
  return out;
}

export function renderSitemap(xml, files) {
  const block = [...files.keys()].map((f) => `  <url>\n    <loc>${SITE + f.replace(/index\.html$/, '')}</loc>\n    <lastmod>${TEACHERS_LASTMOD}</lastmod>\n  </url>`).join('\n');
  const re = /(<!-- TEACHERS: generated by tools\/gen-teachers\.mjs -->)[\s\S]*?(<!-- \/TEACHERS -->)/;
  if (re.test(xml)) return xml.replace(re, `$1\n${block}\n  $2`);
  return xml.replace('</urlset>', `  <!-- TEACHERS: generated by tools/gen-teachers.mjs -->\n${block}\n  <!-- /TEACHERS -->\n</urlset>`);
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
  write('sitemap.xml', renderSitemap(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').replace(/\r\n/g, '\n'), files));
  if (checkOnly && stale.length) { console.error('Out of date (run node tools/gen-teachers.mjs):\n  ' + stale.join('\n  ')); process.exit(1); }
  console.log(checkOnly ? `teacher pages up to date (${files.size})` : `teacher pages written (${files.size})`);
}
